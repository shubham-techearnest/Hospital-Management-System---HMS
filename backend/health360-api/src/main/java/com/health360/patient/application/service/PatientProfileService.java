package com.health360.patient.application.service;

import com.health360.analytics.application.service.MetricsRecalculationService;
import com.health360.patient.domain.HealthTimelineEventType;
import com.health360.patient.infrastructure.persistence.entity.*;
import com.health360.patient.infrastructure.persistence.repository.*;
import com.health360.patient.presentation.dto.request.*;
import com.health360.patient.presentation.dto.response.PatientProfileResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientProfileService {

    private static final int MAX_EMERGENCY_CONTACTS = 5;

    private final PatientProfileRepository profileRepository;
    private final AllergyRepository allergyRepository;
    private final MedicationRepository medicationRepository;
    private final SurgeryRepository surgeryRepository;
    private final ChronicConditionRepository chronicConditionRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final PhysicalMeasurementHistoryRepository measurementHistoryRepository;
    private final VitalSignRecordRepository vitalSignRecordRepository;
    private final HealthTimelineService healthTimelineService;
    private final PatientProfileMapper mapper;
    private final ProfileCompletionCalculator completionCalculator;
    private final AuditLogService auditLogService;
    private final MetricsRecalculationService metricsRecalculationService;

    @Transactional(readOnly = true)
    public PatientProfileResponse getProfile(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = requireExistingProfile(userId, tenantId);
        return toFullResponse(profile);
    }

    @Transactional
    public PatientProfileResponse acceptConsent(UUID userId, UUID tenantId, ConsentRequest request) {
        if (!Boolean.TRUE.equals(request.getAccepted())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Consent must be accepted to create a patient profile");
        }

        PatientProfileEntity profile = profileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId)
                .orElseGet(() -> createEmptyProfile(userId, tenantId));

        if (!profile.isConsentAccepted()) {
            profile.setConsentAccepted(true);
            profile.setConsentAcceptedAt(Instant.now());
            profile.setUpdatedBy(userId);
            profile.touch();
            profile = profileRepository.saveAndFlush(profile);
            if (profile.getId() == null) {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                        "Failed to create patient profile");
            }
            auditLogService.record(tenantId, userId, "PATIENT_CONSENT_ACCEPTED", "PatientProfile",
                    profile.getId(), Map.of());
        }

        return toFullResponse(profile);
    }

    @Transactional
    public PatientProfileResponse updateBasicInfo(UUID userId, UUID tenantId, UpdateBasicInfoRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);

        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender().trim());
        }
        if (request.getBloodGroup() != null) {
            profile.setBloodGroup(request.getBloodGroup().trim());
        }
        if (request.getMaritalStatus() != null) {
            profile.setMaritalStatus(request.getMaritalStatus().trim());
        }
        if (request.getNationality() != null) {
            profile.setNationality(request.getNationality().trim());
        }
        if (request.getProfilePhotoUrl() != null) {
            profile.setProfilePhotoUrl(request.getProfilePhotoUrl().trim().isEmpty()
                    ? null : request.getProfilePhotoUrl().trim());
        }

        saveAndRecalculate(profile, userId, tenantId, "PATIENT_BASIC_INFO_UPDATED");
        return toFullResponse(profile);
    }

    @Transactional
    public PatientProfileResponse updateContactInfo(UUID userId, UUID tenantId, UpdateContactInfoRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);

        if (request.getPrimaryPhone() != null) {
            profile.setPrimaryPhone(request.getPrimaryPhone().trim());
        }
        if (request.getSecondaryPhone() != null) {
            profile.setSecondaryPhone(request.getSecondaryPhone().trim());
        }

        if (request.getPermanentAddress() != null) {
            applyAddress(profile, request.getPermanentAddress(), true);
        }

        if (Boolean.TRUE.equals(request.getSameAsPermanentAddress())) {
            copyPermanentToCurrent(profile);
        } else if (request.getCurrentAddress() != null) {
            applyAddress(profile, request.getCurrentAddress(), false);
        }

        saveAndRecalculate(profile, userId, tenantId, "PATIENT_CONTACT_INFO_UPDATED");
        return toFullResponse(profile);
    }

    @Transactional
    public PatientProfileResponse updatePhysicalMeasurements(
            UUID userId, UUID tenantId, UpdatePhysicalMeasurementsRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);

        if (request.getHeightCm() != null) {
            profile.setHeightCm(request.getHeightCm());
        }
        if (request.getWeightKg() != null) {
            profile.setWeightKg(request.getWeightKg());
        }
        if (request.getWaistCm() != null) {
            profile.setWaistCm(request.getWaistCm());
        }
        if (request.getHipCm() != null) {
            profile.setHipCm(request.getHipCm());
        }
        if (request.getNeckCm() != null) {
            profile.setNeckCm(request.getNeckCm());
        }
        if (request.getBodyFatPercent() != null) {
            profile.setBodyFatPercent(request.getBodyFatPercent());
        }
        profile.setMeasuredAt(request.getMeasuredAt());

        appendMeasurementHistory(profile, userId);
        saveAndRecalculate(profile, userId, tenantId, "PATIENT_MEASUREMENTS_UPDATED");
        return toFullResponse(profile);
    }

    @Transactional(readOnly = true)
    public Page<PatientProfileResponse.PhysicalMeasurementHistoryResponse> getMeasurementHistory(
            UUID userId, UUID tenantId, Pageable pageable) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        return measurementHistoryRepository.findByPatientIdOrderByMeasuredAtDesc(profile.getId(), pageable)
                .map(mapper::toHistory);
    }

    @Transactional
    public PatientProfileResponse updateLifestyle(UUID userId, UUID tenantId, UpdateLifestyleRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);

        if (request.getSmokingStatus() != null) {
            profile.setSmokingStatus(request.getSmokingStatus().trim());
        }
        if (request.getSmokingFrequency() != null) {
            profile.setSmokingFrequency(request.getSmokingFrequency().trim());
        }
        if (request.getAlcoholConsumption() != null) {
            profile.setAlcoholConsumption(request.getAlcoholConsumption().trim());
        }
        if (request.getExerciseFrequency() != null) {
            profile.setExerciseFrequency(request.getExerciseFrequency().trim());
        }
        if (request.getExerciseType() != null) {
            profile.setExerciseType(request.getExerciseType().trim());
        }
        if (request.getExerciseDurationMinutes() != null) {
            profile.setExerciseDurationMinutes(request.getExerciseDurationMinutes());
        }
        if (request.getOccupationType() != null) {
            profile.setOccupationType(request.getOccupationType().trim());
        }
        if (request.getAverageSleepHours() != null) {
            profile.setAverageSleepHours(request.getAverageSleepHours());
        }
        if (request.getDietaryPreference() != null) {
            profile.setDietaryPreference(request.getDietaryPreference().trim());
        }
        if (request.getStressLevel() != null) {
            profile.setStressLevel(request.getStressLevel());
        }

        saveAndRecalculate(profile, userId, tenantId, "PATIENT_LIFESTYLE_UPDATED");
        return toFullResponse(profile);
    }

    @Transactional
    public PatientProfileResponse updateGoals(UUID userId, UUID tenantId, UpdateHealthGoalsRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);

        if (request.getTargetWeightKg() != null) {
            profile.setTargetWeightKg(request.getTargetWeightKg());
        }
        if (request.getDailyStepsGoal() != null) {
            profile.setDailyStepsGoal(request.getDailyStepsGoal());
        }
        if (request.getSleepHoursGoal() != null) {
            profile.setSleepHoursGoal(request.getSleepHoursGoal());
        }
        if (request.getWaterIntakeMlGoal() != null) {
            profile.setWaterIntakeMlGoal(request.getWaterIntakeMlGoal());
        }
        if (request.getWeeklyExerciseMinutesGoal() != null) {
            profile.setWeeklyExerciseMinutesGoal(request.getWeeklyExerciseMinutesGoal());
        }

        saveAndRecalculate(profile, userId, tenantId, "PATIENT_HEALTH_GOALS_UPDATED");
        healthTimelineService.recordEvent(
                tenantId,
                profile.getId(),
                HealthTimelineEventType.PROFILE_UPDATED,
                "Health goals updated",
                "PatientProfile",
                profile.getId(),
                Instant.now(),
                Map.of());
        return toFullResponse(profile);
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse.ProfileCompletionResponse getCompletion(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = requireExistingProfile(userId, tenantId);
        return completionCalculator.calculateBreakdown(profile,
                countAllergies(profile.getId()),
                countMedications(profile.getId()),
                countConditions(profile.getId()),
                (int) emergencyContactRepository.countByPatientIdAndDeletedAtIsNull(profile.getId()),
                (int) vitalSignRecordRepository.countByPatientId(profile.getId()));
    }

    public PatientProfileEntity requireConsentedProfile(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = requireExistingProfile(userId, tenantId);
        if (!profile.isConsentAccepted()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Health data consent must be accepted before updating profile");
        }
        return profile;
    }

    /**
     * Resolves the authenticated user's patient profile for read-only flows (e.g. appointments).
     * Never accepts a patient ID from the client — only JWT user identity.
     */
    @Transactional(readOnly = true)
    public PatientProfileEntity requireProfileForAppointmentAccess(UUID userId, UUID tenantId) {
        return requireExistingProfile(userId, tenantId);
    }

    public void recalculateCompletionForProfile(PatientProfileEntity profile) {
        recalculateCompletion(profile);
        profileRepository.save(profile);
        triggerMetricsRecalculation(profile.getUserId(), profile.getTenantId());
    }

    // --- Allergies ---

    @Transactional(readOnly = true)
    public List<PatientProfileResponse.AllergyResponse> listAllergies(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        return allergyRepository.findByPatientIdAndDeletedAtIsNullOrderByName(profile.getId())
                .stream().map(mapper::toAllergy).toList();
    }

    @Transactional
    public PatientProfileResponse.AllergyResponse createAllergy(
            UUID userId, UUID tenantId, AllergyRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        AllergyEntity entity = new AllergyEntity();
        entity.setTenantId(tenantId);
        entity.setPatientId(profile.getId());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        applyAllergy(entity, request);
        allergyRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
        auditLogService.record(tenantId, userId, "PATIENT_ALLERGY_CREATED", "Allergy",
                entity.getId(), Map.of("name", entity.getName()));
        return mapper.toAllergy(entity);
    }

    @Transactional
    public PatientProfileResponse.AllergyResponse updateAllergy(
            UUID userId, UUID tenantId, UUID allergyId, AllergyRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        AllergyEntity entity = requireAllergy(profile.getId(), allergyId);
        applyAllergy(entity, request);
        entity.setUpdatedBy(userId);
        entity.touch();
        allergyRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
        return mapper.toAllergy(entity);
    }

    @Transactional
    public void deleteAllergy(UUID userId, UUID tenantId, UUID allergyId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        AllergyEntity entity = requireAllergy(profile.getId(), allergyId);
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        allergyRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
    }

    // --- Medications ---

    @Transactional(readOnly = true)
    public List<PatientProfileResponse.MedicationResponse> listMedications(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        return medicationRepository.findByPatientIdAndDeletedAtIsNullOrderByName(profile.getId())
                .stream().map(mapper::toMedication).toList();
    }

    @Transactional
    public PatientProfileResponse.MedicationResponse createMedication(
            UUID userId, UUID tenantId, MedicationRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        MedicationEntity entity = new MedicationEntity();
        entity.setTenantId(tenantId);
        entity.setPatientId(profile.getId());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        applyMedication(entity, request);
        medicationRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
        return mapper.toMedication(entity);
    }

    @Transactional
    public PatientProfileResponse.MedicationResponse updateMedication(
            UUID userId, UUID tenantId, UUID medicationId, MedicationRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        MedicationEntity entity = requireMedication(profile.getId(), medicationId);
        applyMedication(entity, request);
        entity.setUpdatedBy(userId);
        entity.touch();
        medicationRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
        return mapper.toMedication(entity);
    }

    @Transactional
    public void deleteMedication(UUID userId, UUID tenantId, UUID medicationId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        MedicationEntity entity = requireMedication(profile.getId(), medicationId);
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        medicationRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
    }

    // --- Surgeries ---

    @Transactional(readOnly = true)
    public List<PatientProfileResponse.SurgeryResponse> listSurgeries(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        return surgeryRepository.findByPatientIdAndDeletedAtIsNullOrderBySurgeryDateDesc(profile.getId())
                .stream().map(mapper::toSurgery).toList();
    }

    @Transactional
    public PatientProfileResponse.SurgeryResponse createSurgery(
            UUID userId, UUID tenantId, SurgeryRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        SurgeryEntity entity = new SurgeryEntity();
        entity.setTenantId(tenantId);
        entity.setPatientId(profile.getId());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        applySurgery(entity, request);
        surgeryRepository.save(entity);
        return mapper.toSurgery(entity);
    }

    @Transactional
    public PatientProfileResponse.SurgeryResponse updateSurgery(
            UUID userId, UUID tenantId, UUID surgeryId, SurgeryRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        SurgeryEntity entity = requireSurgery(profile.getId(), surgeryId);
        applySurgery(entity, request);
        entity.setUpdatedBy(userId);
        entity.touch();
        surgeryRepository.save(entity);
        return mapper.toSurgery(entity);
    }

    @Transactional
    public void deleteSurgery(UUID userId, UUID tenantId, UUID surgeryId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        SurgeryEntity entity = requireSurgery(profile.getId(), surgeryId);
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        surgeryRepository.save(entity);
    }

    // --- Chronic conditions ---

    @Transactional(readOnly = true)
    public List<PatientProfileResponse.ChronicConditionResponse> listChronicConditions(
            UUID userId, UUID tenantId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        return chronicConditionRepository.findByPatientIdAndDeletedAtIsNullOrderByConditionName(profile.getId())
                .stream().map(mapper::toCondition).toList();
    }

    @Transactional
    public PatientProfileResponse.ChronicConditionResponse createChronicCondition(
            UUID userId, UUID tenantId, ChronicConditionRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        ChronicConditionEntity entity = new ChronicConditionEntity();
        entity.setTenantId(tenantId);
        entity.setPatientId(profile.getId());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        applyChronicCondition(entity, request);
        chronicConditionRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
        return mapper.toCondition(entity);
    }

    @Transactional
    public PatientProfileResponse.ChronicConditionResponse updateChronicCondition(
            UUID userId, UUID tenantId, UUID conditionId, ChronicConditionRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        ChronicConditionEntity entity = requireChronicCondition(profile.getId(), conditionId);
        applyChronicCondition(entity, request);
        entity.setUpdatedBy(userId);
        entity.touch();
        chronicConditionRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
        return mapper.toCondition(entity);
    }

    @Transactional
    public void deleteChronicCondition(UUID userId, UUID tenantId, UUID conditionId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        ChronicConditionEntity entity = requireChronicCondition(profile.getId(), conditionId);
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        chronicConditionRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
    }

    // --- Emergency contacts ---

    @Transactional(readOnly = true)
    public List<PatientProfileResponse.EmergencyContactResponse> listEmergencyContacts(
            UUID userId, UUID tenantId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        return emergencyContactRepository.findByPatientIdAndDeletedAtIsNullOrderByName(profile.getId())
                .stream().map(mapper::toContact).toList();
    }

    @Transactional
    public PatientProfileResponse.EmergencyContactResponse createEmergencyContact(
            UUID userId, UUID tenantId, EmergencyContactRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        if (emergencyContactRepository.countByPatientIdAndDeletedAtIsNull(profile.getId()) >= MAX_EMERGENCY_CONTACTS) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Maximum of " + MAX_EMERGENCY_CONTACTS + " emergency contacts allowed");
        }

        EmergencyContactEntity entity = new EmergencyContactEntity();
        entity.setTenantId(tenantId);
        entity.setPatientId(profile.getId());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        applyEmergencyContact(entity, request);

        if (entity.isPrimaryContact()) {
            clearPrimaryEmergencyContacts(profile.getId());
        }

        emergencyContactRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
        return mapper.toContact(entity);
    }

    @Transactional
    public PatientProfileResponse.EmergencyContactResponse updateEmergencyContact(
            UUID userId, UUID tenantId, UUID contactId, EmergencyContactRequest request) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        EmergencyContactEntity entity = requireEmergencyContact(profile.getId(), contactId);
        applyEmergencyContact(entity, request);

        if (entity.isPrimaryContact()) {
            clearPrimaryEmergencyContactsExcept(profile.getId(), entity.getId());
        }

        entity.setUpdatedBy(userId);
        entity.touch();
        emergencyContactRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
        return mapper.toContact(entity);
    }

    @Transactional
    public void deleteEmergencyContact(UUID userId, UUID tenantId, UUID contactId) {
        PatientProfileEntity profile = requireConsentedProfile(userId, tenantId);
        EmergencyContactEntity entity = requireEmergencyContact(profile.getId(), contactId);
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        emergencyContactRepository.save(entity);
        recalculateCompletionAndMetrics(profile, userId, tenantId);
    }

    // --- Helpers ---

    private PatientProfileEntity createEmptyProfile(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = new PatientProfileEntity();
        profile.setTenantId(tenantId);
        profile.setUserId(userId);
        profile.setCreatedBy(userId);
        profile.setUpdatedBy(userId);
        return profile;
    }

    private PatientProfileEntity requireExistingProfile(UUID userId, UUID tenantId) {
        return profileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient profile not found"));
    }


    private void saveAndRecalculate(PatientProfileEntity profile, UUID userId, UUID tenantId, String auditAction) {
        profile.setUpdatedBy(userId);
        profile.touch();
        recalculateCompletion(profile);
        profileRepository.save(profile);
        auditLogService.record(tenantId, userId, auditAction, "PatientProfile", profile.getId(), Map.of());
        triggerMetricsRecalculation(userId, tenantId);
    }

    private void recalculateCompletionAndMetrics(PatientProfileEntity profile, UUID userId, UUID tenantId) {
        recalculateCompletion(profile);
        triggerMetricsRecalculation(userId, tenantId);
    }

    private void triggerMetricsRecalculation(UUID userId, UUID tenantId) {
        metricsRecalculationService.recalculate(userId, tenantId);
    }

    private void recalculateCompletion(PatientProfileEntity profile) {
        int score = completionCalculator.calculateScore(profile,
                countAllergies(profile.getId()),
                countMedications(profile.getId()),
                countConditions(profile.getId()),
                (int) emergencyContactRepository.countByPatientIdAndDeletedAtIsNull(profile.getId()),
                (int) vitalSignRecordRepository.countByPatientId(profile.getId()));
        profile.setCompletionScore(score);
    }

    private int countAllergies(UUID patientId) {
        return (int) allergyRepository.countByPatientIdAndDeletedAtIsNull(patientId);
    }

    private int countMedications(UUID patientId) {
        return (int) medicationRepository.countByPatientIdAndDeletedAtIsNull(patientId);
    }

    private int countConditions(UUID patientId) {
        return (int) chronicConditionRepository.countByPatientIdAndDeletedAtIsNull(patientId);
    }

    private PatientProfileResponse toFullResponse(PatientProfileEntity profile) {
        UUID patientId = profile.getId();
        return mapper.toFullResponse(profile,
                allergyRepository.findByPatientIdAndDeletedAtIsNullOrderByName(patientId),
                medicationRepository.findByPatientIdAndDeletedAtIsNullOrderByName(patientId),
                surgeryRepository.findByPatientIdAndDeletedAtIsNullOrderBySurgeryDateDesc(patientId),
                chronicConditionRepository.findByPatientIdAndDeletedAtIsNullOrderByConditionName(patientId),
                emergencyContactRepository.findByPatientIdAndDeletedAtIsNullOrderByName(patientId));
    }

    private void appendMeasurementHistory(PatientProfileEntity profile, UUID userId) {
        PhysicalMeasurementHistoryEntity history = new PhysicalMeasurementHistoryEntity();
        history.setTenantId(profile.getTenantId());
        history.setPatientId(profile.getId());
        history.setHeightCm(profile.getHeightCm());
        history.setWeightKg(profile.getWeightKg());
        history.setWaistCm(profile.getWaistCm());
        history.setHipCm(profile.getHipCm());
        history.setNeckCm(profile.getNeckCm());
        history.setBodyFatPercent(profile.getBodyFatPercent());
        history.setMeasuredAt(profile.getMeasuredAt());
        history.setCreatedBy(userId);
        measurementHistoryRepository.save(history);
    }

    private void applyAddress(PatientProfileEntity profile, UpdateContactInfoRequest.AddressDto address, boolean permanent) {
        if (permanent) {
            profile.setPermanentAddressLine1(address.getLine1());
            profile.setPermanentAddressLine2(address.getLine2());
            profile.setPermanentCity(address.getCity());
            profile.setPermanentState(address.getState());
            profile.setPermanentPincode(address.getPincode());
            profile.setPermanentCountry(address.getCountry());
        } else {
            profile.setCurrentAddressLine1(address.getLine1());
            profile.setCurrentAddressLine2(address.getLine2());
            profile.setCurrentCity(address.getCity());
            profile.setCurrentState(address.getState());
            profile.setCurrentPincode(address.getPincode());
            profile.setCurrentCountry(address.getCountry());
        }
    }

    private void copyPermanentToCurrent(PatientProfileEntity profile) {
        profile.setCurrentAddressLine1(profile.getPermanentAddressLine1());
        profile.setCurrentAddressLine2(profile.getPermanentAddressLine2());
        profile.setCurrentCity(profile.getPermanentCity());
        profile.setCurrentState(profile.getPermanentState());
        profile.setCurrentPincode(profile.getPermanentPincode());
        profile.setCurrentCountry(profile.getPermanentCountry());
    }

    private void applyAllergy(AllergyEntity entity, AllergyRequest request) {
        entity.setName(request.getName().trim());
        entity.setSeverity(request.getSeverity().trim());
        entity.setReaction(request.getReaction() != null ? request.getReaction().trim() : null);
        entity.setDiagnosedDate(request.getDiagnosedDate());
    }

    private AllergyEntity requireAllergy(UUID patientId, UUID allergyId) {
        return allergyRepository.findByIdAndPatientIdAndDeletedAtIsNull(allergyId, patientId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Allergy not found"));
    }

    private void applyMedication(MedicationEntity entity, MedicationRequest request) {
        entity.setName(request.getName().trim());
        entity.setDosage(request.getDosage() != null ? request.getDosage().trim() : null);
        entity.setFrequency(request.getFrequency() != null ? request.getFrequency().trim() : null);
        entity.setRoute(request.getRoute() != null ? request.getRoute().trim() : null);
        entity.setStartDate(request.getStartDate());
        entity.setEndDate(request.getEndDate());
        entity.setPrescribingDoctor(request.getPrescribingDoctor() != null
                ? request.getPrescribingDoctor().trim() : null);
    }

    private MedicationEntity requireMedication(UUID patientId, UUID medicationId) {
        return medicationRepository.findByIdAndPatientIdAndDeletedAtIsNull(medicationId, patientId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Medication not found"));
    }

    private void applySurgery(SurgeryEntity entity, SurgeryRequest request) {
        entity.setProcedureName(request.getProcedureName().trim());
        entity.setSurgeryDate(request.getSurgeryDate());
        entity.setHospitalName(request.getHospitalName() != null ? request.getHospitalName().trim() : null);
        entity.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
    }

    private SurgeryEntity requireSurgery(UUID patientId, UUID surgeryId) {
        return surgeryRepository.findByIdAndPatientIdAndDeletedAtIsNull(surgeryId, patientId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Surgery not found"));
    }

    private void applyChronicCondition(ChronicConditionEntity entity, ChronicConditionRequest request) {
        entity.setConditionName(request.getConditionName().trim());
        entity.setDiagnosedDate(request.getDiagnosedDate());
        entity.setStatus(request.getStatus() != null ? request.getStatus().trim() : null);
        entity.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
    }

    private ChronicConditionEntity requireChronicCondition(UUID patientId, UUID conditionId) {
        return chronicConditionRepository.findByIdAndPatientIdAndDeletedAtIsNull(conditionId, patientId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Chronic condition not found"));
    }

    private void applyEmergencyContact(EmergencyContactEntity entity, EmergencyContactRequest request) {
        entity.setName(request.getName().trim());
        entity.setRelationship(request.getRelationship().trim());
        entity.setPhone(request.getPhone().trim());
        entity.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        entity.setPrimaryContact(Boolean.TRUE.equals(request.getPrimary()));
    }

    private EmergencyContactEntity requireEmergencyContact(UUID patientId, UUID contactId) {
        return emergencyContactRepository.findByIdAndPatientIdAndDeletedAtIsNull(contactId, patientId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Emergency contact not found"));
    }

    private void clearPrimaryEmergencyContacts(UUID patientId) {
        emergencyContactRepository.findByPatientIdAndDeletedAtIsNullOrderByName(patientId).stream()
                .filter(EmergencyContactEntity::isPrimaryContact)
                .forEach(contact -> {
                    contact.setPrimaryContact(false);
                    emergencyContactRepository.save(contact);
                });
    }

    private void clearPrimaryEmergencyContactsExcept(UUID patientId, UUID exceptId) {
        emergencyContactRepository.findByPatientIdAndDeletedAtIsNullOrderByName(patientId).stream()
                .filter(c -> c.isPrimaryContact() && !c.getId().equals(exceptId))
                .forEach(contact -> {
                    contact.setPrimaryContact(false);
                    emergencyContactRepository.save(contact);
                });
    }
}
