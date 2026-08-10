package com.health360.doctor.application.service;

import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.doctor.presentation.dto.request.InviteDoctorRequest;
import com.health360.doctor.presentation.dto.response.InviteDoctorResponse;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.iam.application.service.EmailNotificationService;
import com.health360.iam.application.service.EmailVerificationService;
import com.health360.iam.application.service.NotificationPreferenceService;
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
import com.health360.subscription.application.service.PlanLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class DoctorInviteService {

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+=\\-]).{8,}$");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final HospitalAssociationRepository associationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final DoctorProfileProvisioningService doctorProfileProvisioningService;
    private final PlanLimitService planLimitService;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final EmailNotificationService emailNotificationService;
    private final NotificationPreferenceService notificationPreferenceService;
    private final AuditLogService auditLogService;

    @Transactional
    public InviteDoctorResponse inviteDoctor(
            UUID hospitalId, UUID tenantId, UUID actorId, InviteDoctorRequest request) {
        HospitalEntity hospital = hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Hospital not found"));

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByTenantIdAndEmailIgnoreCase(tenantId, email)) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL, HttpStatus.CONFLICT,
                    "A user with this email already exists");
        }

        validateBranchAndDepartment(hospital.getId(), request.getBranchId(), request.getDepartmentId());
        planLimitService.assertCanAddDoctor(hospital.getId(), tenantId);

        String temporaryPassword = resolvePassword(request.getPassword());

        UserEntity user = new UserEntity();
        user.setTenantId(tenantId);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone().trim());
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setEmailVerified(false);
        user.setCreatedBy(actorId);
        user.setUpdatedBy(actorId);
        user = userRepository.saveAndFlush(user);

        assignRole(tenantId, user.getId(), "DOCTOR");
        notificationPreferenceService.seedDefaultsForUser(user);

        DoctorProfileEntity doctor = doctorProfileProvisioningService.ensureProfileEntity(user.getId(), tenantId);

        HospitalAssociationEntity association = new HospitalAssociationEntity();
        association.setTenantId(tenantId);
        association.setDoctorId(doctor.getId());
        association.setHospitalId(hospital.getId());
        association.setBranchId(request.getBranchId());
        association.setDepartmentId(request.getDepartmentId());
        association.setStatus("ACTIVE");
        association.setCreatedBy(actorId);
        association.setUpdatedBy(actorId);
        association = associationRepository.save(association);

        emailVerificationService.createAndSendVerificationToken(user);
        sendInvitationEmail(user, hospital.getName(), temporaryPassword);

        auditLogService.record(tenantId, actorId, "DOCTOR_INVITED", "User", user.getId(),
                Map.of(
                        "hospitalId", hospital.getId(),
                        "doctorId", doctor.getId(),
                        "associationId", association.getId(),
                        "email", email));

        return InviteDoctorResponse.builder()
                .userId(user.getId())
                .doctorId(doctor.getId())
                .associationId(association.getId())
                .email(user.getEmail())
                .status(user.getStatus())
                .invitationEmailSent(true)
                .message("Doctor invited. They must verify their email and complete their profile after first login.")
                .build();
    }

    private void assignRole(UUID tenantId, UUID userId, String roleName) {
        RoleEntity role = roleRepository.findByTenantIdAndName(tenantId, roleName)
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                        "Default role not configured: " + roleName));
        UserRoleEntity userRole = new UserRoleEntity();
        userRole.setTenantId(tenantId);
        userRole.setUserId(userId);
        userRole.setRoleId(role.getId());
        userRoleRepository.save(userRole);
    }

    private void validateBranchAndDepartment(UUID hospitalId, UUID branchId, UUID departmentId) {
        if (branchId != null && branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(branchId, hospitalId).isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Branch not found");
        }
        if (departmentId != null
                && departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(departmentId, hospitalId).isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Department not found");
        }
    }

    private String resolvePassword(String providedPassword) {
        if (providedPassword != null && !providedPassword.isBlank()) {
            if (!PASSWORD_PATTERN.matcher(providedPassword).matches()) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Password must be at least 8 characters with upper, lower, digit, and special character");
            }
            return providedPassword;
        }
        return generateTemporaryPassword();
    }

    private String generateTemporaryPassword() {
        String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String lower = "abcdefghijkmnpqrstuvwxyz";
        String digits = "23456789";
        String special = "!@#$%^&*";
        String all = upper + lower + digits + special;

        char[] password = new char[12];
        password[0] = upper.charAt(SECURE_RANDOM.nextInt(upper.length()));
        password[1] = lower.charAt(SECURE_RANDOM.nextInt(lower.length()));
        password[2] = digits.charAt(SECURE_RANDOM.nextInt(digits.length()));
        password[3] = special.charAt(SECURE_RANDOM.nextInt(special.length()));
        for (int i = 4; i < password.length; i++) {
            password[i] = all.charAt(SECURE_RANDOM.nextInt(all.length()));
        }
        return new String(password);
    }

    private void sendInvitationEmail(UserEntity user, String hospitalName, String temporaryPassword) {
        String subject = "You have been invited to join " + hospitalName + " on Health360";
        String body = """
                Hello %s,

                You have been invited to join %s as a doctor on Health360.

                Sign in with:
                Email: %s
                Temporary password: %s

                Please verify your email using the link we sent separately, then sign in and complete your doctor profile.

                For security, change your password after your first login.

                — Health360 Team
                """.formatted(user.getFirstName(), hospitalName, user.getEmail(), temporaryPassword);
        emailNotificationService.sendTransactionalEmail(user.getEmail(), subject, body);
    }
}
