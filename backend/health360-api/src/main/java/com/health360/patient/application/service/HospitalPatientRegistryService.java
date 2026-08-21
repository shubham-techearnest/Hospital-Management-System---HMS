package com.health360.patient.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.domain.UserStatus;
import com.health360.iam.infrastructure.persistence.entity.RoleEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.entity.UserRoleEntity;
import com.health360.iam.infrastructure.persistence.repository.RoleRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRoleRepository;
import com.health360.patient.application.util.PhoneNormalizer;
import com.health360.patient.exception.DuplicatePatientCandidatesException;
import com.health360.patient.infrastructure.persistence.entity.HospitalRegistrationEntity;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.HospitalRegistrationRepository;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.presentation.dto.request.RegisterHospitalPatientRequest;
import com.health360.patient.presentation.dto.response.DuplicateCandidateResponse;
import com.health360.patient.presentation.dto.response.HospitalPatientSummaryResponse;
import com.health360.patient.presentation.dto.response.PortalInviteResponse;
import com.health360.patient.presentation.dto.response.RegisterHospitalPatientResponse;
import com.health360.patient.presentation.dto.response.RegistrationReceiptResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalPatientRegistryService {

    private static final String REGISTRATION_SOURCE = "HOSPITAL_DESK";
    private static final String PATIENT_ROLE = "PATIENT";

    private final PatientProfileRepository patientProfileRepository;
    private final HospitalRegistrationRepository hospitalRegistrationRepository;
    private final DuplicateDetectionService duplicateDetectionService;
    private final UhidGenerationService uhidGenerationService;
    private final HospitalRegistrationScopeService scopeService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final PatientPortalInviteService portalInviteService;

    @Transactional(readOnly = true)
    public Page<HospitalPatientSummaryResponse> searchPatients(
            UserPrincipal principal,
            String uhid,
            String mobile,
            String firstName,
            String lastName,
            LocalDate dateOfBirth,
            Pageable pageable) {

        assertCanRead(principal);
        UUID tenantId = principal.getTenantId();
        scopeService.resolveScope(principal);

        if (uhid != null && !uhid.isBlank()) {
            String normalized = uhid.trim().toUpperCase();
            return patientProfileRepository.findByTenantIdAndUhidAndDeletedAtIsNull(tenantId, normalized)
                    .map(profile -> new PageImpl<>(List.of(toSummary(profile)), pageable, 1))
                    .orElseGet(() -> new PageImpl<>(List.of(), pageable, 0));
        }

        if (mobile != null && !mobile.isBlank()) {
            String storedPhone = PhoneNormalizer.toStorageFormat(mobile);
            List<HospitalPatientSummaryResponse> results = patientProfileRepository
                    .findByTenantIdAndPrimaryPhone(tenantId, storedPhone)
                    .stream()
                    .map(this::toSummary)
                    .toList();
            auditSearch(principal, "MOBILE", results.size());
            return new PageImpl<>(results, pageable, results.size());
        }

        if (firstName != null && lastName != null && dateOfBirth != null) {
            String nameToken = firstName.trim();
            Page<PatientProfileEntity> page = patientProfileRepository.searchByNameAndDob(
                    tenantId, nameToken, dateOfBirth, pageable);
            Page<HospitalPatientSummaryResponse> mapped = page.map(this::toSummary);
            auditSearch(principal, "NAME_DOB", (int) mapped.getTotalElements());
            return mapped;
        }

        throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                "Provide uhid, mobile, or firstName+lastName+dateOfBirth");
    }

    @Transactional
    public RegisterHospitalPatientResponse registerPatient(
            UserPrincipal principal,
            RegisterHospitalPatientRequest request) {

        assertCanWrite(principal);
        HospitalRegistrationScopeService.RegistrationScope scope = scopeService.resolveScope(principal);
        UUID tenantId = principal.getTenantId();

        String storedPhone = PhoneNormalizer.toStorageFormat(request.getPrimaryPhone());
        List<DuplicateCandidateResponse> candidates = duplicateDetectionService.findCandidates(
                tenantId,
                storedPhone,
                request.getLegalFirstName(),
                request.getLegalLastName(),
                request.getDateOfBirth());

        if (duplicateDetectionService.shouldBlockRegistration(candidates) && !request.isDuplicateOverride()) {
            auditLogService.record(tenantId, principal.getUserId(), "DUPLICATE_CANDIDATES_SHOWN",
                    "PatientProfile", null,
                    Map.of("candidateCount", candidates.size()));
            throw new DuplicatePatientCandidatesException(candidates);
        }

        if (request.isDuplicateOverride()) {
            assertCanOverrideDuplicate(principal);
            if (request.getDuplicateOverrideReason() == null
                    || request.getDuplicateOverrideReason().trim().length() < 10) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Duplicate override reason must be at least 10 characters");
            }
            auditLogService.record(tenantId, principal.getUserId(), "DUPLICATE_OVERRIDE",
                    "PatientProfile", null,
                    Map.of("reason", request.getDuplicateOverrideReason().trim(),
                            "candidateCount", candidates.size()));
        }

        String uhid = uhidGenerationService.allocateUhid(tenantId);
        String tempPassword = generateTemporaryPassword();
        UserEntity user = createStubPatientUser(
                request, tenantId, storedPhone, principal.getUserId(), uhid, tempPassword);
        assignPatientRole(tenantId, user.getId(), principal.getUserId());

        PatientProfileEntity profile = new PatientProfileEntity();
        profile.setTenantId(tenantId);
        profile.setUserId(user.getId());
        profile.setLegalFirstName(request.getLegalFirstName().trim());
        profile.setLegalLastName(request.getLegalLastName().trim());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender().trim());
        profile.setPrimaryPhone(storedPhone);
        if (request.getSecondaryPhone() != null && !request.getSecondaryPhone().isBlank()) {
            profile.setSecondaryPhone(PhoneNormalizer.toStorageFormat(request.getSecondaryPhone()));
        }
        profile.setBloodGroup(request.getBloodGroup());
        profile.setPermanentAddressLine1(request.getPermanentAddressLine1());
        profile.setPermanentAddressLine2(request.getPermanentAddressLine2());
        profile.setPermanentCity(request.getPermanentCity());
        profile.setPermanentState(request.getPermanentState());
        profile.setPermanentPincode(request.getPermanentPincode());
        profile.setPermanentCountry(request.getPermanentCountry() != null ? request.getPermanentCountry() : "IN");
        profile.setRegistrationSource(REGISTRATION_SOURCE);
        profile.setConsentAccepted(true);
        profile.setConsentAcceptedAt(Instant.now());
        profile.setCreatedBy(principal.getUserId());
        profile.setUpdatedBy(principal.getUserId());
        profile.setUhid(uhid);

        PatientProfileEntity savedProfile = patientProfileRepository.save(profile);

        HospitalRegistrationEntity registration = new HospitalRegistrationEntity();
        registration.setTenantId(tenantId);
        registration.setPatientId(savedProfile.getId());
        registration.setHospitalId(scope.hospitalId());
        registration.setBranchId(scope.branchId());
        registration.setRegisteredAt(Instant.now());
        registration.setRegisteredBy(principal.getUserId());
        registration.setRegistrationNumber(uhid);
        registration.setCreatedBy(principal.getUserId());
        registration.setUpdatedBy(principal.getUserId());
        HospitalRegistrationEntity savedRegistration = hospitalRegistrationRepository.save(registration);

        auditLogService.record(tenantId, principal.getUserId(), "REGISTRATION_CREATED",
                "PatientProfile", savedProfile.getId(),
                Map.of("uhid", uhid, "hospitalId", scope.hospitalId().toString()));
        auditLogService.record(tenantId, principal.getUserId(), "UHID_ASSIGNED",
                "PatientProfile", savedProfile.getId(),
                Map.of("uhid", uhid));

        PortalInviteResponse invite = portalInviteService.createInvite(principal, savedProfile.getId());

        return RegisterHospitalPatientResponse.builder()
                .patientId(savedProfile.getId())
                .uhid(uhid)
                .hospitalRegistrationId(savedRegistration.getId())
                .receiptPath("/api/v1/hospital/patients/" + savedProfile.getId() + "/registration-receipt")
                .portalInviteLink(invite.getInviteLink())
                .portalInviteMessage(invite.getMessage())
                .temporaryLoginEmail(user.getEmail())
                .temporaryPassword(tempPassword)
                .build();
    }

    @Transactional(readOnly = true)
    public HospitalPatientSummaryResponse getPatient(UserPrincipal principal, UUID patientId) {
        assertCanRead(principal);
        scopeService.resolveScope(principal);
        PatientProfileEntity profile = requireProfile(principal.getTenantId(), patientId);
        return toSummary(profile);
    }

    @Transactional(readOnly = true)
    public RegistrationReceiptResponse getRegistrationReceipt(UserPrincipal principal, UUID patientId) {
        assertCanRead(principal);
        HospitalRegistrationScopeService.RegistrationScope scope = scopeService.resolveScope(principal);
        PatientProfileEntity profile = requireProfile(principal.getTenantId(), patientId);

        HospitalRegistrationEntity registration = findRegistration(profile.getId(), scope)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Hospital registration not found for this patient"));

        return RegistrationReceiptResponse.builder()
                .patientId(profile.getId())
                .uhid(profile.getUhid())
                .legalName(buildDisplayName(profile))
                .primaryPhone(profile.getPrimaryPhone())
                .hospitalName(scope.hospitalName())
                .hospitalId(scope.hospitalId())
                .branchId(scope.branchId())
                .registeredAt(registration.getRegisteredAt())
                .hospitalRegistrationId(registration.getId())
                .build();
    }

    @Transactional
    public RegisterHospitalPatientResponse linkExistingPatientToHospital(
            UserPrincipal principal, UUID patientId) {

        assertCanWrite(principal);
        HospitalRegistrationScopeService.RegistrationScope scope = scopeService.resolveScope(principal);
        PatientProfileEntity profile = requireProfile(principal.getTenantId(), patientId);

        if (findRegistration(profile.getId(), scope).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Patient already registered at this hospital");
        }

        HospitalRegistrationEntity registration = new HospitalRegistrationEntity();
        registration.setTenantId(principal.getTenantId());
        registration.setPatientId(profile.getId());
        registration.setHospitalId(scope.hospitalId());
        registration.setBranchId(scope.branchId());
        registration.setRegisteredAt(Instant.now());
        registration.setRegisteredBy(principal.getUserId());
        registration.setRegistrationNumber(profile.getUhid());
        registration.setCreatedBy(principal.getUserId());
        registration.setUpdatedBy(principal.getUserId());
        HospitalRegistrationEntity saved = hospitalRegistrationRepository.save(registration);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "HOSPITAL_REGISTRATION_LINKED",
                "PatientProfile", profile.getId(),
                Map.of("hospitalId", scope.hospitalId().toString()));

        return RegisterHospitalPatientResponse.builder()
                .patientId(profile.getId())
                .uhid(profile.getUhid())
                .hospitalRegistrationId(saved.getId())
                .receiptPath("/api/v1/hospital/patients/" + profile.getId() + "/registration-receipt")
                .build();
    }

    private java.util.Optional<HospitalRegistrationEntity> findRegistration(
            UUID patientId, HospitalRegistrationScopeService.RegistrationScope scope) {
        if (scope.branchId() != null) {
            return hospitalRegistrationRepository.findByPatientIdAndHospitalIdAndBranchIdAndDeletedAtIsNull(
                    patientId, scope.hospitalId(), scope.branchId());
        }
        return hospitalRegistrationRepository.findByPatientIdAndHospitalIdAndBranchIdIsNullAndDeletedAtIsNull(
                patientId, scope.hospitalId());
    }

    private PatientProfileEntity requireProfile(UUID tenantId, UUID patientId) {
        return patientProfileRepository.findById(patientId)
                .filter(p -> p.getDeletedAt() == null && p.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Patient not found"));
    }

    private UserEntity createStubPatientUser(
            RegisterHospitalPatientRequest request,
            UUID tenantId,
            String storedPhone,
            UUID actorId,
            String uhid,
            String temporaryPassword) {

        String loginEmail = toDeskLoginEmail(uhid);
        UserEntity user = new UserEntity();
        user.setTenantId(tenantId);
        user.setEmail(loginEmail);
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setFirstName(request.getLegalFirstName().trim());
        user.setLastName(request.getLegalLastName().trim());
        user.setPhone(storedPhone);
        // ACTIVE so patient can log in immediately with desk credentials (SMS deferred → terminal log).
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        user.setCreatedBy(actorId);
        user.setUpdatedBy(actorId);
        UserEntity saved = userRepository.save(user);

        logDeskCredentials(uhid, loginEmail, temporaryPassword, storedPhone);
        return saved;
    }

    private static String toDeskLoginEmail(String uhid) {
        return uhid.trim().toLowerCase().replace('_', '-') + "@patient.health360.local";
    }

    private static String generateTemporaryPassword() {
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            sb.append(alphabet.charAt(random.nextInt(alphabet.length())));
        }
        return sb.toString();
    }

    private void logDeskCredentials(String uhid, String loginEmail, String temporaryPassword, String phone) {
        org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(HospitalPatientRegistryService.class);
        log.info("""
                
                ===== PATIENT DESK CREDENTIALS (SMS deferred — verify manually) =====
                UHID: {}
                Phone: {}
                Login email (username): {}
                Temporary password: {}
                Login URL: /login  (patient should change password after first login)
                ======================================================================
                """,
                uhid, phone, loginEmail, temporaryPassword);
    }

    private void assignPatientRole(UUID tenantId, UUID userId, UUID assignedBy) {
        RoleEntity role = roleRepository.findByTenantIdAndName(tenantId, PATIENT_ROLE)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR, "PATIENT role not configured"));

        List<String> existingRoles = userRoleRepository.findRoleNamesByUserId(userId);
        if (existingRoles.contains(PATIENT_ROLE)) {
            return;
        }

        UserRoleEntity userRole = new UserRoleEntity();
        userRole.setTenantId(tenantId);
        userRole.setUserId(userId);
        userRole.setRoleId(role.getId());
        userRole.setAssignedBy(assignedBy);
        userRoleRepository.save(userRole);
    }

    private HospitalPatientSummaryResponse toSummary(PatientProfileEntity profile) {
        String portalStatus = "PENDING_ACTIVATION";
        if (profile.getUserId() != null) {
            portalStatus = userRepository.findById(profile.getUserId())
                    .map(u -> UserStatus.ACTIVE.equals(u.getStatus()) && u.isEmailVerified()
                            ? "ACTIVE"
                            : "PENDING_ACTIVATION")
                    .orElse("PENDING_ACTIVATION");
        }
        return HospitalPatientSummaryResponse.builder()
                .patientId(profile.getId())
                .uhid(profile.getUhid())
                .legalName(buildDisplayName(profile))
                .primaryPhone(profile.getPrimaryPhone())
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .bloodGroup(profile.getBloodGroup())
                .permanentCity(profile.getPermanentCity())
                .permanentState(profile.getPermanentState())
                .portalAccountStatus(portalStatus)
                .build();
    }

    private String buildDisplayName(PatientProfileEntity profile) {
        String first = profile.getLegalFirstName() != null ? profile.getLegalFirstName() : "";
        String last = profile.getLegalLastName() != null ? profile.getLegalLastName() : "";
        return (first + " " + last).trim();
    }

    private void auditSearch(UserPrincipal principal, String searchType, int resultCount) {
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PATIENT_SEARCH",
                "PatientProfile", null,
                Map.of("searchType", searchType, "resultCount", resultCount));
    }

    private void assertCanRead(UserPrincipal principal) {
        if (!principal.hasPermission("patient:registry:read")) {
            throw forbidden();
        }
    }

    private void assertCanWrite(UserPrincipal principal) {
        if (!principal.hasPermission("patient:registry:write")) {
            throw forbidden();
        }
    }

    private void assertCanOverrideDuplicate(UserPrincipal principal) {
        if (!principal.hasPermission("patient:registry:duplicate_override")) {
            throw forbidden();
        }
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
