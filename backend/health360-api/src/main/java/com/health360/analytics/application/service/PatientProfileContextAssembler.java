package com.health360.analytics.application.service;

import com.health360.analytics.domain.PatientProfileContext;
import com.health360.patient.infrastructure.persistence.entity.AllergyEntity;
import com.health360.patient.infrastructure.persistence.entity.FamilyMemberEntity;
import com.health360.patient.infrastructure.persistence.entity.LabValueRecordEntity;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.entity.VitalSignRecordEntity;
import com.health360.patient.infrastructure.persistence.repository.AllergyRepository;
import com.health360.patient.infrastructure.persistence.repository.ChronicConditionRepository;
import com.health360.patient.infrastructure.persistence.repository.EmergencyContactRepository;
import com.health360.patient.infrastructure.persistence.repository.FamilyMemberRepository;
import com.health360.patient.infrastructure.persistence.repository.HealthDocumentRepository;
import com.health360.patient.infrastructure.persistence.repository.LabValueRecordRepository;
import com.health360.patient.infrastructure.persistence.repository.MedicationRepository;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.infrastructure.persistence.repository.VitalSignRecordRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PatientProfileContextAssembler {

    private static final List<String> SEVERE_ALLERGY_LEVELS = List.of("SEVERE", "CRITICAL", "HIGH");

    private final PatientProfileRepository profileRepository;
    private final AllergyRepository allergyRepository;
    private final MedicationRepository medicationRepository;
    private final ChronicConditionRepository chronicConditionRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final LabValueRecordRepository labValueRecordRepository;
    private final HealthDocumentRepository healthDocumentRepository;
    private final VitalSignRecordRepository vitalSignRecordRepository;

    public PatientProfileContext assemble(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = profileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient profile not found"));

        UUID patientId = profile.getId();
        List<AllergyEntity> allergies = allergyRepository.findByPatientIdAndDeletedAtIsNullOrderByName(patientId);
        int severeAllergyCount = (int) allergies.stream()
                .filter(a -> a.getSeverity() != null
                        && SEVERE_ALLERGY_LEVELS.contains(a.getSeverity().trim().toUpperCase()))
                .count();

        PatientProfileContext.LatestVitals latestVitals = vitalSignRecordRepository
                .findFirstByPatientIdOrderByRecordedAtDesc(patientId)
                .map(this::toLatestVitals)
                .orElse(null);

        PatientProfileContext.LatestLabs latestLabs = labValueRecordRepository
                .findFirstByPatientIdOrderByRecordedAtDesc(patientId)
                .map(this::toLatestLabs)
                .orElse(null);

        int familyMemberCount = (int) familyMemberRepository.countByPatientIdAndDeletedAtIsNull(patientId);
        int familyWithHereditaryCount = (int) familyMemberRepository
                .findByPatientIdAndDeletedAtIsNullOrderByName(patientId).stream()
                .filter(this::hasHereditaryConditions)
                .count();

        return new PatientProfileContext(
                patientId,
                tenantId,
                profile.getDateOfBirth(),
                profile.getGender(),
                profile.getPrimaryPhone(),
                profile.getPermanentAddressLine1(),
                profile.getPermanentCity(),
                profile.getPermanentPincode(),
                profile.getHeightCm(),
                profile.getWeightKg(),
                profile.getWaistCm(),
                profile.getHipCm(),
                profile.getBodyFatPercent(),
                profile.getSmokingStatus(),
                profile.getAlcoholConsumption(),
                profile.getExerciseFrequency(),
                profile.getAverageSleepHours(),
                profile.getStressLevel(),
                profile.getOccupationType(),
                profile.getTargetWeightKg(),
                profile.getDailyStepsGoal(),
                profile.getSleepHoursGoal(),
                profile.getWaterIntakeMlGoal(),
                latestVitals,
                latestLabs,
                allergies.size(),
                severeAllergyCount,
                (int) medicationRepository.countByPatientIdAndDeletedAtIsNull(patientId),
                (int) chronicConditionRepository.countByPatientIdAndDeletedAtIsNull(patientId),
                (int) emergencyContactRepository.countByPatientIdAndDeletedAtIsNull(patientId),
                familyMemberCount,
                familyWithHereditaryCount,
                (int) vitalSignRecordRepository.countByPatientId(patientId),
                (int) labValueRecordRepository.countByPatientId(patientId),
                (int) healthDocumentRepository.countByPatientIdAndDeletedAtIsNull(patientId),
                profile.getCompletionScore());
    }

    private boolean hasHereditaryConditions(FamilyMemberEntity member) {
        return member.getHereditaryConditions() != null && !member.getHereditaryConditions().isEmpty();
    }

    private PatientProfileContext.LatestLabs toLatestLabs(LabValueRecordEntity record) {
        return new PatientProfileContext.LatestLabs(
                record.getHba1c(),
                record.getLdl(),
                record.getHdl());
    }

    private PatientProfileContext.LatestVitals toLatestVitals(VitalSignRecordEntity record) {
        return new PatientProfileContext.LatestVitals(
                record.getSystolicBp(),
                record.getDiastolicBp(),
                record.getHeartRate(),
                record.getSpo2(),
                record.getBloodGlucose(),
                record.getGlucoseReadingType());
    }
}
