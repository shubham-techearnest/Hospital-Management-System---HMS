package com.health360.scheduling.application.service;

import com.health360.doctor.infrastructure.persistence.entity.ConsultationDefaultEntity;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.doctor.infrastructure.persistence.repository.ConsultationDefaultRepository;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.patient.application.service.PatientProfileService;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.entity.TimeSlotEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.scheduling.infrastructure.persistence.repository.TimeSlotRepository;
import com.health360.scheduling.presentation.dto.request.BookAppointmentRequest;
import com.health360.scheduling.presentation.dto.response.AppointmentBookingResponse;
import com.health360.scheduling.presentation.dto.response.DoctorBookingLocationResponse;
import com.health360.scheduling.presentation.dto.response.DoctorAvailabilityResponse;
import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.iam.domain.NotificationType;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.application.service.PlanLimitService;
import com.health360.subscription.domain.PlanFeatureKeys;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.shared.infrastructure.persistence.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final String VERIFIED = "VERIFIED";

    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileService patientProfileService;
    private final ConsultationDefaultRepository consultationDefaultRepository;
    private final HospitalAssociationRepository hospitalAssociationRepository;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
    private final AuditLogService auditLogService;
    private final TransactionalNotificationService notificationService;
    private final PlanLimitService planLimitService;
    private final FeatureAccessService featureAccessService;

    @Transactional(readOnly = true)
    public List<DoctorBookingLocationResponse> getDoctorBookingLocations(UUID doctorId, UUID tenantId) {
        DoctorProfileEntity doctor = doctorProfileRepository.findByIdAndTenantIdAndDeletedAtIsNull(doctorId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Doctor not found"));

        if (!VERIFIED.equals(doctor.getVerificationStatus())) {
            return List.of();
        }

        return hospitalAssociationRepository.findByDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(doctor.getId())
                .stream()
                .filter(a -> "ACTIVE".equals(a.getStatus()) && a.getBranchId() != null)
                .map(this::toBookingLocation)
                .toList();
    }

    private DoctorBookingLocationResponse toBookingLocation(HospitalAssociationEntity association) {
        HospitalEntity hospital = hospitalRepository.findById(association.getHospitalId()).orElseThrow();
        BranchEntity branch = branchRepository.findById(association.getBranchId()).orElseThrow();
        return DoctorBookingLocationResponse.builder()
                .hospitalId(hospital.getId())
                .hospitalName(hospital.getName())
                .branchId(branch.getId())
                .branchName(branch.getName())
                .city(branch.getCity())
                .build();
    }

    @Transactional(readOnly = true)
    public DoctorAvailabilityResponse getDoctorAvailability(
            UUID doctorId,
            UUID tenantId,
            UUID hospitalId,
            UUID branchId,
            LocalDate fromDate,
            LocalDate toDate) {
        DoctorProfileEntity doctor = doctorProfileRepository.findByIdAndTenantIdAndDeletedAtIsNull(doctorId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Doctor not found"));

        if (!VERIFIED.equals(doctor.getVerificationStatus())) {
            return DoctorAvailabilityResponse.builder()
                    .doctorId(doctorId)
                    .hospitalId(hospitalId)
                    .branchId(branchId)
                    .days(List.of())
                    .build();
        }

        LocalDate from = fromDate != null ? fromDate : LocalDate.now();
        LocalDate to = toDate != null ? toDate : from.plusDays(30);

        List<TimeSlotEntity> slots = timeSlotRepository
                .findByDoctorIdAndHospitalIdAndBranchIdAndSlotDateBetweenAndDeletedAtIsNullOrderBySlotDateAscStartTimeAsc(
                        doctorId, hospitalId, branchId, from, to);

        Map<LocalDate, List<DoctorAvailabilityResponse.SlotAvailability>> grouped = new LinkedHashMap<>();
        for (TimeSlotEntity slot : slots) {
            grouped.computeIfAbsent(slot.getSlotDate(), d -> new ArrayList<>())
                    .add(DoctorAvailabilityResponse.SlotAvailability.builder()
                            .id(slot.getId())
                            .startTime(slot.getStartTime())
                            .endTime(slot.getEndTime())
                            .consultationType(slot.getConsultationType())
                            .status(slot.getStatus())
                            .build());
        }

        List<DoctorAvailabilityResponse.DayAvailability> days = grouped.entrySet().stream()
                .map(e -> DoctorAvailabilityResponse.DayAvailability.builder()
                        .date(e.getKey())
                        .slots(e.getValue())
                        .build())
                .toList();

        return DoctorAvailabilityResponse.builder()
                .doctorId(doctorId)
                .hospitalId(hospitalId)
                .branchId(branchId)
                .days(days)
                .build();
    }

    @Transactional
    public AppointmentBookingResponse bookAppointment(UUID userId, UUID tenantId, BookAppointmentRequest request) {
        PatientProfileEntity patient = patientProfileService.requireConsentedProfile(userId, tenantId);

        DoctorProfileEntity doctor = doctorProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getDoctorId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Doctor not found"));

        if (!VERIFIED.equals(doctor.getVerificationStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Appointments can only be booked with verified doctors");
        }

        TimeSlotEntity slot = timeSlotRepository.findByIdForUpdate(request.getSlotId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Time slot not found"));

        if (!slot.getDoctorId().equals(request.getDoctorId())
                || !slot.getHospitalId().equals(request.getHospitalId())
                || !slot.getBranchId().equals(request.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Slot does not match the selected doctor and location");
        }

        if (!"AVAILABLE".equals(slot.getStatus())) {
            throw new BusinessException(ErrorCode.SLOT_UNAVAILABLE, HttpStatus.CONFLICT,
                    "Selected time slot is no longer available");
        }

        if (!request.getConsultationType().equals(slot.getConsultationType())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Consultation type does not match the selected slot");
        }

        Instant dayStart = slot.getSlotDate().atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant dayEnd = slot.getSlotDate().plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        if (appointmentRepository.existsActiveAppointmentForPatientDoctorOnDate(
                patient.getId(), doctor.getId(), dayStart, dayEnd)) {
            throw new BusinessException(ErrorCode.DUPLICATE_APPOINTMENT, HttpStatus.CONFLICT,
                    "You already have an appointment with this doctor on the selected date");
        }

        planLimitService.assertCanBookAppointment(request.getHospitalId(), tenantId);

        if ("TELECONSULTATION".equals(request.getConsultationType())
                && !featureAccessService.hasFeature(request.getHospitalId(), tenantId, PlanFeatureKeys.FEATURE_TELEMEDICINE)) {
            throw new BusinessException(ErrorCode.FEATURE_NOT_AVAILABLE, HttpStatus.FORBIDDEN,
                    "Teleconsultation is not available on this hospital's current plan. Please choose an in-person appointment.");
        }

        ConsultationDefaultEntity feeDefault = consultationDefaultRepository
                .findByDoctorIdAndConsultationTypeAndDeletedAtIsNull(doctor.getId(), request.getConsultationType())
                .orElseGet(() -> defaultFee(doctor.getId(), request.getConsultationType()));

        Instant scheduledAt = slot.getSlotDate().atTime(slot.getStartTime()).toInstant(ZoneOffset.UTC);

        AppointmentEntity appointment = new AppointmentEntity();
        appointment.setTenantId(tenantId);
        appointment.setPatientId(patient.getId());
        appointment.setDoctorId(doctor.getId());
        appointment.setHospitalId(request.getHospitalId());
        appointment.setBranchId(request.getBranchId());
        appointment.setSlotId(slot.getId());
        appointment.setConsultationType(request.getConsultationType());
        appointment.setConsultationFee(feeDefault.getFeeAmount());
        appointment.setCurrency(feeDefault.getCurrency());
        appointment.setStatus("PENDING");
        appointment.setReasonForVisit(request.getReasonForVisit());
        appointment.setScheduledAt(scheduledAt);
        appointment.setCreatedBy(userId);
        appointment.setUpdatedBy(userId);
        appointment = appointmentRepository.saveAndFlush(appointment);

        slot.setStatus("BOOKED");
        slot.setAppointmentId(appointment.getId());
        slot.setUpdatedBy(userId);
        timeSlotRepository.save(slot);

        auditLogService.record(tenantId, userId, "APPOINTMENT_BOOKED", "Appointment",
                appointment.getId(), Map.of("doctorId", doctor.getId().toString()));

        notifyBookingConfirmation(tenantId, patient, doctor, appointment);

        return buildBookingResponse(appointment, doctor, request.getHospitalId(), request.getBranchId());
    }

    private void notifyBookingConfirmation(
            UUID tenantId,
            PatientProfileEntity patient,
            DoctorProfileEntity doctor,
            AppointmentEntity appointment) {
        String message = "Appointment request received for " + appointment.getScheduledAt()
                + ". Awaiting doctor confirmation.";
        notificationService.send(tenantId, patient.getUserId(), NotificationType.APPOINTMENT_CONFIRMATION,
                "Appointment request submitted", message, "Appointment", appointment.getId());
        notificationService.send(tenantId, doctor.getUserId(), NotificationType.APPOINTMENT_CONFIRMATION,
                "New appointment request", message, "Appointment", appointment.getId());
    }

    private ConsultationDefaultEntity defaultFee(UUID doctorId, String consultationType) {
        ConsultationDefaultEntity fallback = new ConsultationDefaultEntity();
        fallback.setDoctorId(doctorId);
        fallback.setConsultationType(consultationType);
        fallback.setFeeAmount(BigDecimal.ZERO);
        fallback.setCurrency("INR");
        fallback.setDurationMinutes(15);
        return fallback;
    }

    private AppointmentBookingResponse buildBookingResponse(
            AppointmentEntity appointment,
            DoctorProfileEntity doctor,
            UUID hospitalId,
            UUID branchId) {
        UserEntity doctorUser = userRepository.findById(doctor.getUserId())
                .orElseThrow();
        HospitalEntity hospital = hospitalRepository.findById(hospitalId).orElseThrow();
        BranchEntity branch = branchRepository.findById(branchId).orElseThrow();

        String specialization = doctor.getPrimarySpecializationId() != null
                ? specializationRepository.findById(doctor.getPrimarySpecializationId())
                .map(s -> s.getName())
                .orElse(null)
                : null;

        return AppointmentBookingResponse.builder()
                .appointmentId(appointment.getId())
                .status(appointment.getStatus())
                .doctor(AppointmentBookingResponse.DoctorSummary.builder()
                        .id(doctor.getId())
                        .name(doctorUser.getFirstName() + " " + doctorUser.getLastName())
                        .specialization(specialization)
                        .build())
                .hospital(AppointmentBookingResponse.HospitalSummary.builder()
                        .id(hospital.getId())
                        .branchId(branch.getId())
                        .name(hospital.getName())
                        .branchName(branch.getName())
                        .build())
                .scheduledAt(appointment.getScheduledAt())
                .consultationType(appointment.getConsultationType())
                .consultationFee(AppointmentBookingResponse.FeeSummary.builder()
                        .amount(appointment.getConsultationFee())
                        .currency(appointment.getCurrency())
                        .build())
                .reasonForVisit(appointment.getReasonForVisit())
                .build();
    }
}
