package com.health360.patient.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.doctor.application.service.DoctorProfileProvisioningService;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.AllergyRepository;
import com.health360.patient.infrastructure.persistence.repository.ChronicConditionRepository;
import com.health360.patient.infrastructure.persistence.repository.LabValueRecordRepository;
import com.health360.patient.infrastructure.persistence.repository.MedicationRepository;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.infrastructure.persistence.repository.VitalSignRecordRepository;
import com.health360.patient.presentation.dto.response.LabValueResponse;
import com.health360.patient.presentation.dto.response.PatientSummaryResponse;
import com.health360.patient.presentation.dto.response.VitalSignResponse;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientSummaryService {

    private static final List<String> ACTIVE_APPOINTMENT_STATUSES =
            List.of("PENDING", "CONFIRMED", "ARRIVED", "POSTPONED", "IN_PROGRESS");

    private final DoctorProfileProvisioningService doctorProfileProvisioningService;
    private final AppointmentRepository appointmentRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterAccessService encounterAccessService;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final AllergyRepository allergyRepository;
    private final MedicationRepository medicationRepository;
    private final ChronicConditionRepository chronicConditionRepository;
    private final VitalSignRecordRepository vitalSignRecordRepository;
    private final LabValueRecordRepository labValueRecordRepository;
    private final VitalSignService vitalSignService;
    private final LabValueService labValueService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PatientSummaryResponse getSummary(
            UUID doctorUserId, UUID tenantId, UUID patientId, UUID appointmentId) {
        DoctorProfileEntity doctor = doctorProfileProvisioningService.ensureProfileEntity(doctorUserId, tenantId);

        AppointmentEntity appointment = appointmentRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(appointmentId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Appointment not found"));

        if (!appointment.getDoctorId().equals(doctor.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Appointment does not belong to this doctor");
        }

        if (!appointment.getPatientId().equals(patientId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Appointment does not match the requested patient");
        }

        validateAppointmentWindow(appointment);

        PatientSummaryResponse response = buildSummary(tenantId, patientId);
        auditLogService.record(tenantId, doctorUserId, "PATIENT_SUMMARY_ACCESSED", "PatientProfile",
                patientId, Map.of("appointmentId", appointmentId.toString()));
        return response;
    }

    @Transactional(readOnly = true)
    public PatientSummaryResponse getSummaryForEncounter(
            UserPrincipal principal, UUID patientId, UUID encounterId) {
        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounterId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));

        if (!encounter.getPatientId().equals(patientId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Encounter does not match the requested patient");
        }

        encounterAccessService.assertCanReadEncounter(principal, encounter);

        PatientSummaryResponse response = buildSummary(principal.getTenantId(), patientId);
        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "PATIENT_SUMMARY_ACCESSED", "PatientProfile",
                patientId, Map.of("encounterId", encounterId.toString()));
        return response;
    }

    private PatientSummaryResponse buildSummary(UUID tenantId, UUID patientId) {
        PatientProfileEntity profile = patientProfileRepository.findById(patientId)
                .filter(p -> p.getDeletedAt() == null && p.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient not found"));

        UserEntity patientUser = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient not found"));

        String name = (patientUser.getFirstName() + " " + patientUser.getLastName()).trim();
        Integer age = profile.getDateOfBirth() != null
                ? Period.between(profile.getDateOfBirth(), LocalDate.now()).getYears()
                : null;

        List<PatientSummaryResponse.AllergySummary> allergies = allergyRepository
                .findByPatientIdAndDeletedAtIsNullOrderByName(patientId).stream()
                .map(a -> PatientSummaryResponse.AllergySummary.builder()
                        .name(a.getName())
                        .severity(a.getSeverity())
                        .reaction(a.getReaction())
                        .build())
                .toList();

        List<PatientSummaryResponse.MedicationSummary> medications = medicationRepository
                .findByPatientIdAndDeletedAtIsNullOrderByName(patientId).stream()
                .map(m -> PatientSummaryResponse.MedicationSummary.builder()
                        .name(m.getName())
                        .dosage(m.getDosage())
                        .frequency(m.getFrequency())
                        .build())
                .toList();

        List<PatientSummaryResponse.ChronicConditionSummary> chronicConditions = chronicConditionRepository
                .findByPatientIdAndDeletedAtIsNullOrderByConditionName(patientId).stream()
                .map(c -> PatientSummaryResponse.ChronicConditionSummary.builder()
                        .conditionName(c.getConditionName())
                        .status(c.getStatus())
                        .build())
                .toList();

        VitalSignResponse latestVitals = vitalSignRecordRepository
                .findFirstByPatientIdOrderByRecordedAtDesc(patientId)
                .map(vitalSignService::toResponse)
                .orElse(null);

        LabValueResponse latestLabValues = labValueRecordRepository
                .findFirstByPatientIdOrderByRecordedAtDesc(patientId)
                .map(labValueService::toResponse)
                .orElse(null);

        return PatientSummaryResponse.builder()
                .name(name)
                .age(age)
                .gender(profile.getGender())
                .allergies(allergies)
                .medications(medications)
                .chronicConditions(chronicConditions)
                .latestVitals(latestVitals)
                .latestLabValues(latestLabValues)
                .healthGoals(buildHealthGoals(profile))
                .build();
    }

    private void validateAppointmentWindow(AppointmentEntity appointment) {
        if (!ACTIVE_APPOINTMENT_STATUSES.contains(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Patient summary is only available for active appointments");
        }

        // ARRIVED patients may stay past the original ±24h window during a long OPD day.
        long hours = "ARRIVED".equals(appointment.getStatus()) ? 72 : 24;
        Instant now = Instant.now();
        Instant windowStart = appointment.getScheduledAt().minus(hours, ChronoUnit.HOURS);
        Instant windowEnd = appointment.getScheduledAt().plus(hours, ChronoUnit.HOURS);

        if (now.isBefore(windowStart) || now.isAfter(windowEnd)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Patient summary is only available within the appointment care window");
        }
    }

    private List<PatientSummaryResponse.HealthGoalSummary> buildHealthGoals(PatientProfileEntity profile) {
        List<PatientSummaryResponse.HealthGoalSummary> goals = new ArrayList<>();

        if (profile.getTargetWeightKg() != null) {
            goals.add(PatientSummaryResponse.HealthGoalSummary.builder()
                    .goalType("WEIGHT")
                    .label("Target Weight")
                    .targetDisplay(profile.getTargetWeightKg() + " kg")
                    .build());
        }
        if (profile.getDailyStepsGoal() != null) {
            goals.add(PatientSummaryResponse.HealthGoalSummary.builder()
                    .goalType("STEPS")
                    .label("Daily Steps")
                    .targetDisplay(profile.getDailyStepsGoal() + " steps")
                    .build());
        }
        if (profile.getSleepHoursGoal() != null) {
            goals.add(PatientSummaryResponse.HealthGoalSummary.builder()
                    .goalType("SLEEP")
                    .label("Sleep Hours")
                    .targetDisplay(profile.getSleepHoursGoal() + " hrs")
                    .build());
        }
        if (profile.getWaterIntakeMlGoal() != null) {
            goals.add(PatientSummaryResponse.HealthGoalSummary.builder()
                    .goalType("WATER")
                    .label("Daily Water")
                    .targetDisplay(profile.getWaterIntakeMlGoal() + " ml")
                    .build());
        }
        if (profile.getWeeklyExerciseMinutesGoal() != null) {
            goals.add(PatientSummaryResponse.HealthGoalSummary.builder()
                    .goalType("EXERCISE")
                    .label("Weekly Exercise")
                    .targetDisplay(profile.getWeeklyExerciseMinutesGoal() + " min/week")
                    .build());
        }

        return goals;
    }
}
