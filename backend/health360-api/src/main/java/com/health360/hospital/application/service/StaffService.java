package com.health360.hospital.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.domain.StaffEmploymentStatus;
import com.health360.hospital.infrastructure.persistence.entity.StaffEntity;
import com.health360.hospital.infrastructure.persistence.entity.StaffRoleAssignmentEntity;
import com.health360.hospital.infrastructure.persistence.repository.StaffRepository;
import com.health360.hospital.infrastructure.persistence.repository.StaffRoleAssignmentRepository;
import com.health360.hospital.presentation.dto.request.InviteStaffRequest;
import com.health360.hospital.presentation.dto.response.StaffResponse;
import com.health360.iam.domain.UserStatus;
import com.health360.iam.infrastructure.persistence.entity.RoleEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.entity.UserRoleEntity;
import com.health360.iam.infrastructure.persistence.repository.RoleRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRoleRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffService {

    private static final Set<String> INVITABLE_ROLES = Set.of(
            "RECEPTIONIST",
            "NURSE",
            "ICU_NURSE",
            "LAB_TECHNICIAN",
            "RADIOLOGY_TECHNICIAN",
            "PHARMACIST",
            "OT_COORDINATOR"
    );

    private final StaffRepository staffRepository;
    private final StaffRoleAssignmentRepository staffRoleAssignmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final EncounterAccessService encounterAccessService;
    private final HospitalScopeService hospitalScopeService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional
    public StaffResponse inviteStaff(UserPrincipal principal, InviteStaffRequest request) {
        assertCanInvite(principal);
        encounterAccessService.assertHospitalAdminScope(principal, request.getHospitalId());

        String roleName = request.getRoleName().trim().toUpperCase();
        if (!INVITABLE_ROLES.contains(roleName)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid staff role: " + roleName);
        }

        UUID tenantId = principal.getTenantId();
        String email = request.getEmail().trim().toLowerCase();

        UserEntity user = userRepository.findByTenantIdAndEmailIgnoreCase(tenantId, email)
                .orElseGet(() -> createStaffUser(request, tenantId, email, principal.getUserId()));

        if (staffRepository.existsByUserIdAndHospitalIdAndEmploymentStatusAndDeletedAtIsNull(
                user.getId(), request.getHospitalId(), StaffEmploymentStatus.ACTIVE.name())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Staff member already active at this hospital");
        }

        assignIamRole(tenantId, user.getId(), roleName, principal.getUserId());

        StaffEntity staff = new StaffEntity();
        staff.setTenantId(tenantId);
        staff.setUserId(user.getId());
        staff.setHospitalId(request.getHospitalId());
        staff.setBranchId(request.getBranchId());
        staff.setDepartmentId(request.getDepartmentId());
        staff.setJobTitle(request.getJobTitle());
        staff.setEmploymentStatus(StaffEmploymentStatus.ACTIVE.name());
        staff.setHiredAt(Instant.now());
        staff.setCreatedBy(principal.getUserId());
        staff.setUpdatedBy(principal.getUserId());
        StaffEntity savedStaff = staffRepository.save(staff);

        StaffRoleAssignmentEntity roleAssignment = new StaffRoleAssignmentEntity();
        roleAssignment.setTenantId(tenantId);
        roleAssignment.setStaffId(savedStaff.getId());
        roleAssignment.setRoleName(roleName);
        roleAssignment.setAssignedAt(Instant.now());
        roleAssignment.setAssignedBy(principal.getUserId());
        roleAssignment.setCreatedBy(principal.getUserId());
        roleAssignment.setUpdatedBy(principal.getUserId());
        staffRoleAssignmentRepository.save(roleAssignment);

        auditLogService.record(tenantId, principal.getUserId(), "STAFF_INVITED",
                "Staff", savedStaff.getId(),
                Map.of("userId", user.getId().toString(), "role", roleName));

        return toResponse(savedStaff, user, List.of(roleName));
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> listStaff(UserPrincipal principal, UUID hospitalId) {
        assertCanRead(principal);
        encounterAccessService.assertHospitalAdminScope(principal, hospitalId);

        UUID tenantId = principal.getTenantId();
        return staffRepository.findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        tenantId, hospitalId)
                .stream()
                .map(staff -> {
                    UserEntity user = userRepository.findById(staff.getUserId()).orElseThrow();
                    List<String> roles = staffRoleAssignmentRepository.findByStaffIdAndDeletedAtIsNull(staff.getId())
                            .stream()
                            .map(StaffRoleAssignmentEntity::getRoleName)
                            .toList();
                    return toResponse(staff, user, roles);
                })
                .toList();
    }

    @Transactional
    public StaffResponse deactivateStaff(UserPrincipal principal, UUID staffId) {
        assertCanWrite(principal);
        UUID tenantId = principal.getTenantId();

        StaffEntity staff = staffRepository.findByIdAndTenantIdAndDeletedAtIsNull(staffId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Staff member not found"));

        encounterAccessService.assertHospitalAdminScope(principal, staff.getHospitalId());

        staff.setEmploymentStatus(StaffEmploymentStatus.INACTIVE.name());
        staff.setUpdatedBy(principal.getUserId());
        staffRepository.save(staff);

        UserEntity user = userRepository.findById(staff.getUserId()).orElseThrow();
        List<String> roles = staffRoleAssignmentRepository.findByStaffIdAndDeletedAtIsNull(staff.getId())
                .stream()
                .map(StaffRoleAssignmentEntity::getRoleName)
                .toList();

        auditLogService.record(tenantId, principal.getUserId(), "STAFF_DEACTIVATED",
                "Staff", staff.getId(), Map.of());

        return toResponse(staff, user, roles);
    }

    private UserEntity createStaffUser(InviteStaffRequest request, UUID tenantId, String email, UUID invitedBy) {
        UserEntity user = new UserEntity();
        user.setTenantId(tenantId);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getTemporaryPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        user.setCreatedBy(invitedBy);
        user.setUpdatedBy(invitedBy);
        return userRepository.save(user);
    }

    private void assignIamRole(UUID tenantId, UUID userId, String roleName, UUID assignedBy) {
        RoleEntity role = roleRepository.findByTenantIdAndName(tenantId, roleName)
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                        "Role not configured: " + roleName));

        List<String> existingRoles = userRoleRepository.findRoleNamesByUserId(userId);
        if (existingRoles.contains(roleName)) {
            return;
        }

        UserRoleEntity userRole = new UserRoleEntity();
        userRole.setTenantId(tenantId);
        userRole.setUserId(userId);
        userRole.setRoleId(role.getId());
        userRole.setAssignedBy(assignedBy);
        userRoleRepository.save(userRole);
    }

    private void assertCanInvite(UserPrincipal principal) {
        if (!principal.hasPermission("staff:invite")) {
            throw forbidden();
        }
    }

    private void assertCanRead(UserPrincipal principal) {
        if (!principal.hasPermission("staff:read")) {
            throw forbidden();
        }
    }

    private void assertCanWrite(UserPrincipal principal) {
        if (!principal.hasPermission("staff:write")) {
            throw forbidden();
        }
    }

    private StaffResponse toResponse(StaffEntity staff, UserEntity user, List<String> roles) {
        return StaffResponse.builder()
                .staffId(staff.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .hospitalId(staff.getHospitalId())
                .branchId(staff.getBranchId())
                .departmentId(staff.getDepartmentId())
                .jobTitle(staff.getJobTitle())
                .employmentStatus(staff.getEmploymentStatus())
                .hiredAt(staff.getHiredAt())
                .roles(roles)
                .build();
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
