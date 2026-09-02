package com.health360.patient.application.service;

import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.patient.application.util.PhoneNormalizer;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Resolves platform self-registered patients (iam.users) for hospital desk search and walk-in.
 * App users may exist without a patient_profiles row until first hospital encounter or consent.
 */
@Service
@RequiredArgsConstructor
public class PlatformPatientLookupService {

    private static final String REGISTRATION_SOURCE_APP = "APP";

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final PatientUhidAssignmentService patientUhidAssignmentService;

    @Transactional(readOnly = true)
    public List<PatientProfileEntity> findProfilesByPhoneLast10(UUID tenantId, String phoneLast10) {
        requireLast10(phoneLast10);
        return patientProfileRepository.findByTenantIdAndPhoneLast10(tenantId, phoneLast10);
    }

    @Transactional(readOnly = true)
    public List<UserEntity> findAppPatientUsersByPhoneLast10(UUID tenantId, String phoneLast10) {
        requireLast10(phoneLast10);
        return userRepository.findPatientUsersByPhoneLast10(tenantId, phoneLast10);
    }

    /**
     * Merges profile matches with platform users (auto-provisioning a minimal profile when needed).
     */
    @Transactional
    public List<PatientProfileEntity> resolveProfilesByMobile(
            UUID tenantId, String mobile, UUID actorUserId) {

        String last10 = PhoneNormalizer.normalize(mobile);
        requireLast10(last10);

        Map<UUID, PatientProfileEntity> merged = new LinkedHashMap<>();
        findProfilesByPhoneLast10(tenantId, last10)
                .forEach(profile -> merged.put(profile.getId(), profile));

        for (UserEntity user : findAppPatientUsersByPhoneLast10(tenantId, last10)) {
            PatientProfileEntity profile = ensureProfileForAppUser(user, actorUserId);
            merged.put(profile.getId(), profile);
        }

        merged.replaceAll((id, profile) -> patientUhidAssignmentService.ensureAssigned(profile, actorUserId));

        return List.copyOf(merged.values());
    }

    @Transactional
    public PatientProfileEntity resolveProfileByEmail(UUID tenantId, String email, UUID actorUserId) {
        UserEntity user = userRepository.findPatientUserByEmail(tenantId, email.trim())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Patient not found"));
        PatientProfileEntity profile = ensureProfileForAppUser(user, actorUserId);
        return patientUhidAssignmentService.ensureAssigned(profile, actorUserId);
    }

    @Transactional
    public List<PatientProfileEntity> resolveProfilesByNameAndDob(
            UUID tenantId,
            String firstName,
            String lastName,
            LocalDate dateOfBirth,
            UUID actorUserId) {

        Map<UUID, PatientProfileEntity> merged = new LinkedHashMap<>();
        patientProfileRepository.searchByNameAndDob(
                        tenantId, firstName.trim(), lastName.trim(), dateOfBirth, Pageable.unpaged())
                .forEach(profile -> merged.put(profile.getId(), profile));

        for (UserEntity user : userRepository.findPatientUsersByName(tenantId, firstName, lastName)) {
            PatientProfileEntity profile = ensureProfileForAppUser(user, actorUserId);
            if (profile.getDateOfBirth() == null || profile.getDateOfBirth().equals(dateOfBirth)) {
                merged.put(profile.getId(), profile);
            }
        }

        merged.replaceAll((id, profile) -> patientUhidAssignmentService.ensureAssigned(profile, actorUserId));
        return List.copyOf(merged.values());
    }

    @Transactional
    public List<PatientProfileEntity> resolveProfilesByName(
            UUID tenantId,
            String firstName,
            String lastName,
            UUID actorUserId) {

        Map<UUID, PatientProfileEntity> merged = new LinkedHashMap<>();
        patientProfileRepository.searchByName(tenantId, firstName.trim(), lastName.trim(), Pageable.unpaged())
                .forEach(profile -> merged.put(profile.getId(), profile));

        for (UserEntity user : userRepository.findPatientUsersByName(tenantId, firstName, lastName)) {
            PatientProfileEntity profile = ensureProfileForAppUser(user, actorUserId);
            merged.put(profile.getId(), profile);
        }

        merged.replaceAll((id, profile) -> patientUhidAssignmentService.ensureAssigned(profile, actorUserId));
        return List.copyOf(merged.values());
    }

    @Transactional
    public PatientProfileEntity ensureProfileForAppUser(UserEntity user, UUID actorUserId) {
        UUID tenantId = user.getTenantId();
        PatientProfileEntity profile = patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, user.getId())
                .map(this::backfillProfileFromUserIfNeeded)
                .orElseGet(() -> createProfileFromAppUser(user, actorUserId));
        return profile;
    }

    @Transactional(readOnly = true)
    public PatientProfileEntity findProfileByPatientOrUserId(UUID tenantId, UUID id) {
        return patientProfileRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, tenantId)
                .or(() -> patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, id))
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Patient not found"));
    }

    @Transactional
    public PatientProfileEntity resolveProfileByPatientOrUserId(UUID tenantId, UUID id, UUID actorUserId) {
        return patientProfileRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, tenantId)
                .or(() -> patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, id))
                .orElseGet(() -> userRepository.findById(id)
                        .filter(user -> user.getTenantId().equals(tenantId))
                        .map(user -> ensureProfileForAppUser(user, actorUserId))
                        .orElseThrow(() -> new BusinessException(
                                ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Patient not found")));
    }

    private PatientProfileEntity backfillProfileFromUserIfNeeded(PatientProfileEntity profile) {
        UserEntity user = userRepository.findById(profile.getUserId()).orElse(null);
        if (user == null) {
            return profile;
        }
        boolean changed = false;
        if (isBlank(profile.getLegalFirstName()) && !isBlank(user.getFirstName())) {
            profile.setLegalFirstName(user.getFirstName().trim());
            changed = true;
        }
        if (isBlank(profile.getLegalLastName()) && !isBlank(user.getLastName())) {
            profile.setLegalLastName(user.getLastName().trim());
            changed = true;
        }
        if (isBlank(profile.getPrimaryPhone()) && !isBlank(user.getPhone())) {
            profile.setPrimaryPhone(PhoneNormalizer.toStorageFormat(user.getPhone()));
            changed = true;
        }
        if (changed) {
            profile.touch();
            return patientProfileRepository.save(profile);
        }
        return profile;
    }

    private PatientProfileEntity createProfileFromAppUser(UserEntity user, UUID actorUserId) {
        UUID actor = actorUserId != null ? actorUserId : user.getId();
        PatientProfileEntity profile = new PatientProfileEntity();
        profile.setTenantId(user.getTenantId());
        profile.setUserId(user.getId());
        profile.setLegalFirstName(user.getFirstName().trim());
        profile.setLegalLastName(user.getLastName().trim());
        profile.setPrimaryPhone(PhoneNormalizer.toStorageFormat(user.getPhone()));
        profile.setRegistrationSource(REGISTRATION_SOURCE_APP);
        profile.setConsentAccepted(true);
        profile.setConsentAcceptedAt(Instant.now());
        profile.setCreatedBy(actor);
        profile.setUpdatedBy(actor);
        return patientProfileRepository.save(profile);
    }

    private static void requireLast10(String phoneLast10) {
        if (phoneLast10 == null || phoneLast10.length() != 10) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Enter a valid 10-digit mobile number");
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
