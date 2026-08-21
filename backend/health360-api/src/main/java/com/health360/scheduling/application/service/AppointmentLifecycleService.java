package com.health360.scheduling.application.service;

import com.health360.doctor.application.service.DoctorProfileProvisioningService;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.iam.domain.NotificationType;
import com.health360.patient.application.service.PatientProfileService;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.scheduling.domain.AppointmentFilter;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.entity.TimeSlotEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.scheduling.infrastructure.persistence.repository.TimeSlotRepository;
import com.health360.scheduling.presentation.dto.request.AppointmentActionRequest;
import com.health360.scheduling.presentation.dto.request.CancelAppointmentRequest;
import com.health360.scheduling.presentation.dto.request.RescheduleAppointmentRequest;
import com.health360.scheduling.presentation.dto.request.UpdateAppointmentStatusRequest;
import com.health360.scheduling.presentation.dto.response.AppointmentDetailResponse;
import com.health360.scheduling.presentation.dto.response.AppointmentSummaryResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentLifecycleService {

    private static final Duration CANCELLATION_WINDOW = Duration.ofHours(2);
    private static final Set<String> CANCELLABLE = Set.of("PENDING", "CONFIRMED", "POSTPONED");
    private static final Set<String> RESCHEDULABLE = Set.of("CONFIRMED");
    private static final Set<String> UPCOMING = Set.of("PENDING", "CONFIRMED", "POSTPONED");
    private static final Set<String> CANCELLED_STATUSES = Set.of("CANCELLED", "RESCHEDULED");

    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PatientProfileService patientProfileService;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorProfileProvisioningService profileProvisioningService;
    private final AppointmentSummaryMapper appointmentSummaryMapper;
    private final TransactionalNotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<AppointmentSummaryResponse> listPatientAppointments(
            UUID userId, UUID tenantId, String filter, Pageable pageable) {
        AppointmentFilter parsed = AppointmentFilter.parse(filter);
        return patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId)
                .map(patient -> {
                    List<AppointmentEntity> appointments = appointmentRepository
                            .findByPatientIdAndTenantIdAndDeletedAtIsNullOrderByScheduledAtDesc(
                                    patient.getId(), tenantId);
                    List<AppointmentSummaryResponse> summaries = appointmentSummaryMapper.toSummaries(
                            filterAppointments(appointments, parsed), ViewContext.PATIENT);
                    return paginate(summaries, pageable);
                })
                .orElseGet(() -> Page.empty(pageable));
    }

    @Transactional(readOnly = true)
    public List<AppointmentSummaryResponse> listDoctorAppointments(UUID userId, UUID tenantId, String filter) {
        AppointmentFilter parsed = AppointmentFilter.parse(filter);
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        List<AppointmentEntity> appointments = appointmentRepository
                .findByDoctorIdAndTenantIdAndDeletedAtIsNullOrderByScheduledAtDesc(doctor.getId(), tenantId);
        return appointmentSummaryMapper.toSummaries(filterAppointments(appointments, parsed), ViewContext.DOCTOR);
    }

    @Transactional(readOnly = true)
    public AppointmentDetailResponse getPatientAppointment(UUID userId, UUID tenantId, UUID appointmentId) {
        PatientProfileEntity patient = patientProfileService.requireProfileForAppointmentAccess(userId, tenantId);
        AppointmentEntity appointment = requireAppointment(appointmentId, tenantId);
        if (!appointment.getPatientId().equals(patient.getId())) {
            throw forbidden();
        }
        return appointmentSummaryMapper.toDetail(appointment, ViewContext.PATIENT);
    }

    @Transactional(readOnly = true)
    public AppointmentDetailResponse getDoctorAppointment(UUID userId, UUID tenantId, UUID appointmentId) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        AppointmentEntity appointment = requireAppointment(appointmentId, tenantId);
        if (!appointment.getDoctorId().equals(doctor.getId())) {
            throw forbidden();
        }
        return appointmentSummaryMapper.toDetail(appointment, ViewContext.DOCTOR);
    }

    @Transactional
    public AppointmentDetailResponse cancelAppointment(
            UUID userId,
            UUID tenantId,
            UUID appointmentId,
            CancelAppointmentRequest request,
            boolean asDoctor) {
        AppointmentEntity appointment = appointmentRepository.findByIdForUpdate(appointmentId)
                .filter(a -> a.getTenantId().equals(tenantId))
                .orElseThrow(this::notFound);

        if (asDoctor) {
            DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
            if (!appointment.getDoctorId().equals(doctor.getId())) {
                throw forbidden();
            }
        } else {
            PatientProfileEntity patient = patientProfileService.requireProfileForAppointmentAccess(userId, tenantId);
            if (!appointment.getPatientId().equals(patient.getId())) {
                throw forbidden();
            }
        }

        if (!CANCELLABLE.contains(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Only pending or confirmed appointments can be cancelled");
        }

        if (!withinCancellationWindow(appointment.getScheduledAt())) {
            throw new BusinessException(ErrorCode.CANCELLATION_NOT_ALLOWED, HttpStatus.BAD_REQUEST,
                    "Appointments can only be cancelled at least 2 hours before the scheduled time");
        }

        releaseSlot(appointment.getSlotId(), userId);

        appointment.setStatus("CANCELLED");
        appointment.setCancelledAt(Instant.now());
        appointment.setCancellationReason(request.getReason());
        appointment.setUpdatedBy(userId);
        appointmentRepository.save(appointment);

        auditLogService.record(tenantId, userId, "APPOINTMENT_CANCELLED", "Appointment",
                appointment.getId(), Map.of("status", "CANCELLED"));

        notifyCancellation(appointment);
        return appointmentSummaryMapper.toDetail(appointment, asDoctor ? ViewContext.DOCTOR : ViewContext.PATIENT);
    }

    @Transactional
    public AppointmentDetailResponse rescheduleAppointment(
            UUID userId,
            UUID tenantId,
            UUID appointmentId,
            RescheduleAppointmentRequest request) {
        PatientProfileEntity patient = patientProfileService.requireProfileForAppointmentAccess(userId, tenantId);

        AppointmentEntity appointment = appointmentRepository.findByIdForUpdate(appointmentId)
                .filter(a -> a.getTenantId().equals(tenantId))
                .orElseThrow(this::notFound);

        if (!appointment.getPatientId().equals(patient.getId())) {
            throw forbidden();
        }

        if (!RESCHEDULABLE.contains(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Only confirmed appointments can be rescheduled");
        }

        if (!withinCancellationWindow(appointment.getScheduledAt())) {
            throw new BusinessException(ErrorCode.CANCELLATION_NOT_ALLOWED, HttpStatus.BAD_REQUEST,
                    "Appointments can only be rescheduled at least 2 hours before the scheduled time");
        }

        TimeSlotEntity newSlot = timeSlotRepository.findByIdForUpdate(request.getNewSlotId())
                .orElseThrow(() -> notFound("Time slot not found"));

        if (!newSlot.getDoctorId().equals(appointment.getDoctorId())
                || !newSlot.getHospitalId().equals(appointment.getHospitalId())
                || !newSlot.getBranchId().equals(appointment.getBranchId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "New slot must be with the same doctor and location");
        }

        if (!"AVAILABLE".equals(newSlot.getStatus())) {
            throw new BusinessException(ErrorCode.SLOT_UNAVAILABLE, HttpStatus.CONFLICT,
                    "Selected time slot is no longer available");
        }

        if (!newSlot.getConsultationType().equals(appointment.getConsultationType())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Consultation type must match the original appointment");
        }

        Instant scheduledAt = newSlot.getSlotDate().atTime(newSlot.getStartTime()).toInstant(ZoneOffset.UTC);

        AppointmentEntity newAppointment = new AppointmentEntity();
        newAppointment.setTenantId(tenantId);
        newAppointment.setPatientId(appointment.getPatientId());
        newAppointment.setDoctorId(appointment.getDoctorId());
        newAppointment.setHospitalId(appointment.getHospitalId());
        newAppointment.setBranchId(appointment.getBranchId());
        newAppointment.setSlotId(newSlot.getId());
        newAppointment.setConsultationType(appointment.getConsultationType());
        newAppointment.setConsultationFee(appointment.getConsultationFee());
        newAppointment.setCurrency(appointment.getCurrency());
        newAppointment.setStatus("CONFIRMED");
        newAppointment.setReasonForVisit(appointment.getReasonForVisit());
        newAppointment.setScheduledAt(scheduledAt);
        newAppointment.setRescheduledFromId(appointment.getId());
        newAppointment.setCreatedBy(userId);
        newAppointment.setUpdatedBy(userId);
        newAppointment = appointmentRepository.saveAndFlush(newAppointment);

        newSlot.setStatus("BOOKED");
        newSlot.setAppointmentId(newAppointment.getId());
        newSlot.setUpdatedBy(userId);
        timeSlotRepository.save(newSlot);

        releaseSlot(appointment.getSlotId(), userId);

        appointment.setStatus("RESCHEDULED");
        appointment.setRescheduledToId(newAppointment.getId());
        appointment.setUpdatedBy(userId);
        appointmentRepository.save(appointment);

        auditLogService.record(tenantId, userId, "APPOINTMENT_RESCHEDULED", "Appointment",
                newAppointment.getId(), Map.of("fromAppointmentId", appointment.getId().toString()));

        notifyReschedule(appointment, newAppointment);
        return appointmentSummaryMapper.toDetail(newAppointment, ViewContext.PATIENT);
    }

    @Transactional
    public AppointmentDetailResponse updateAppointmentStatus(
            UUID userId,
            UUID tenantId,
            UUID appointmentId,
            UpdateAppointmentStatusRequest request) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);

        AppointmentEntity appointment = appointmentRepository.findByIdForUpdate(appointmentId)
                .filter(a -> a.getTenantId().equals(tenantId))
                .orElseThrow(this::notFound);

        if (!appointment.getDoctorId().equals(doctor.getId())) {
            throw forbidden();
        }

        if (!Set.of("CONFIRMED", "ARRIVED").contains(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Only confirmed or arrived appointments can be marked completed or no-show");
        }

        String newStatus = request.getStatus();
        if ("COMPLETED".equals(newStatus)) {
            appointment.setStatus("COMPLETED");
            appointment.setCompletedAt(Instant.now());
        } else if ("NO_SHOW".equals(newStatus)) {
            appointment.setStatus("NO_SHOW");
        } else {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Invalid status transition");
        }

        appointment.setUpdatedBy(userId);
        appointmentRepository.save(appointment);

        auditLogService.record(tenantId, userId, "APPOINTMENT_STATUS_UPDATED", "Appointment",
                appointment.getId(), Map.of("status", newStatus));

        if ("COMPLETED".equals(newStatus)) {
            notifyCompleted(appointment);
        }

        return appointmentSummaryMapper.toDetail(appointment, ViewContext.DOCTOR);
    }

    @Transactional
    public AppointmentDetailResponse confirmAppointment(UUID userId, UUID tenantId, UUID appointmentId) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        AppointmentEntity appointment = appointmentRepository.findByIdForUpdate(appointmentId)
                .filter(a -> a.getTenantId().equals(tenantId))
                .orElseThrow(this::notFound);

        if (!appointment.getDoctorId().equals(doctor.getId())) {
            throw forbidden();
        }
        if (!"PENDING".equals(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Only pending appointments can be confirmed");
        }

        appointment.setStatus("CONFIRMED");
        appointment.setUpdatedBy(userId);
        appointmentRepository.save(appointment);

        auditLogService.record(tenantId, userId, "APPOINTMENT_CONFIRMED", "Appointment",
                appointment.getId(), Map.of("status", "CONFIRMED"));

        notifyConfirmed(appointment);
        return appointmentSummaryMapper.toDetail(appointment, ViewContext.DOCTOR);
    }

    @Transactional
    public AppointmentDetailResponse requestReschedule(
            UUID userId, UUID tenantId, UUID appointmentId, AppointmentActionRequest request) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        AppointmentEntity appointment = appointmentRepository.findByIdForUpdate(appointmentId)
                .filter(a -> a.getTenantId().equals(tenantId))
                .orElseThrow(this::notFound);

        if (!appointment.getDoctorId().equals(doctor.getId())) {
            throw forbidden();
        }
        if (!Set.of("CONFIRMED", "PENDING", "POSTPONED").contains(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Cannot request reschedule for this appointment");
        }

        appointment.setRescheduleRequestedAt(Instant.now());
        if (request != null && request.getMessage() != null && !request.getMessage().isBlank()) {
            appointment.setDoctorNotes(request.getMessage().trim());
        }
        appointment.setUpdatedBy(userId);
        appointmentRepository.save(appointment);

        auditLogService.record(tenantId, userId, "APPOINTMENT_RESCHEDULE_REQUESTED", "Appointment",
                appointment.getId(), Map.of());

        notifyRescheduleRequest(appointment, request != null ? request.getMessage() : null);
        return appointmentSummaryMapper.toDetail(appointment, ViewContext.DOCTOR);
    }

    @Transactional
    public AppointmentDetailResponse postponeAppointment(
            UUID userId, UUID tenantId, UUID appointmentId, AppointmentActionRequest request) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        AppointmentEntity appointment = appointmentRepository.findByIdForUpdate(appointmentId)
                .filter(a -> a.getTenantId().equals(tenantId))
                .orElseThrow(this::notFound);

        if (!appointment.getDoctorId().equals(doctor.getId())) {
            throw forbidden();
        }
        if (!Set.of("CONFIRMED", "PENDING").contains(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Only pending or confirmed appointments can be postponed");
        }

        appointment.setStatus("POSTPONED");
        appointment.setPostponedAt(Instant.now());
        if (request != null && request.getMessage() != null && !request.getMessage().isBlank()) {
            appointment.setPostponeReason(request.getMessage().trim());
        }
        appointment.setUpdatedBy(userId);
        appointmentRepository.save(appointment);

        auditLogService.record(tenantId, userId, "APPOINTMENT_POSTPONED", "Appointment",
                appointment.getId(), Map.of("status", "POSTPONED"));

        notifyPostponed(appointment);
        return appointmentSummaryMapper.toDetail(appointment, ViewContext.DOCTOR);
    }

    @Transactional
    public AppointmentDetailResponse resumeAppointment(UUID userId, UUID tenantId, UUID appointmentId) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        AppointmentEntity appointment = appointmentRepository.findByIdForUpdate(appointmentId)
                .filter(a -> a.getTenantId().equals(tenantId))
                .orElseThrow(this::notFound);

        if (!appointment.getDoctorId().equals(doctor.getId())) {
            throw forbidden();
        }
        if (!"POSTPONED".equals(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST,
                    "Only postponed appointments can be resumed");
        }

        appointment.setStatus("CONFIRMED");
        appointment.setPostponedAt(null);
        appointment.setPostponeReason(null);
        appointment.setUpdatedBy(userId);
        appointmentRepository.save(appointment);

        auditLogService.record(tenantId, userId, "APPOINTMENT_RESUMED", "Appointment",
                appointment.getId(), Map.of("status", "CONFIRMED"));

        notifyResumed(appointment);
        return appointmentSummaryMapper.toDetail(appointment, ViewContext.DOCTOR);
    }

    private List<AppointmentEntity> filterAppointments(List<AppointmentEntity> appointments, AppointmentFilter filter) {
        Instant now = Instant.now();
        return appointments.stream()
                .filter(a -> switch (filter) {
                    case UPCOMING -> UPCOMING.contains(a.getStatus()) && isUpcoming(a.getScheduledAt(), now);
                    case PAST -> isPast(a, now);
                    case CANCELLED -> CANCELLED_STATUSES.contains(a.getStatus());
                    case ALL -> true;
                })
                .sorted(Comparator.comparing(
                        AppointmentEntity::getScheduledAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .collect(Collectors.toList());
    }

    private boolean isUpcoming(Instant scheduledAt, Instant now) {
        return scheduledAt != null && !scheduledAt.isBefore(now);
    }

    private boolean isPast(AppointmentEntity appointment, Instant now) {
        if ("COMPLETED".equals(appointment.getStatus()) || "NO_SHOW".equals(appointment.getStatus())) {
            return true;
        }
        Instant scheduledAt = appointment.getScheduledAt();
        return UPCOMING.contains(appointment.getStatus()) && scheduledAt != null && scheduledAt.isBefore(now);
    }

    private <T> Page<T> paginate(List<T> items, Pageable pageable) {
        int total = items.size();
        int start = (int) pageable.getOffset();
        if (start >= total) {
            return new PageImpl<>(List.of(), pageable, total);
        }
        int end = Math.min(start + pageable.getPageSize(), total);
        return new PageImpl<>(items.subList(start, end), pageable, total);
    }

    private void releaseSlot(UUID slotId, UUID userId) {
        timeSlotRepository.findById(slotId).ifPresent(slot -> {
            slot.setStatus("AVAILABLE");
            slot.setAppointmentId(null);
            slot.setUpdatedBy(userId);
            timeSlotRepository.save(slot);
        });
    }

    private boolean withinCancellationWindow(Instant scheduledAt) {
        if (scheduledAt == null) {
            return false;
        }
        return Duration.between(Instant.now(), scheduledAt).compareTo(CANCELLATION_WINDOW) >= 0;
    }

    private AppointmentEntity requireAppointment(UUID appointmentId, UUID tenantId) {
        return appointmentRepository.findByIdAndTenantIdAndDeletedAtIsNull(appointmentId, tenantId)
                .orElseThrow(this::notFound);
    }

    private DoctorProfileEntity requireDoctor(UUID userId, UUID tenantId) {
        return profileProvisioningService.ensureProfileEntity(userId, tenantId);
    }

    private void notifyCancellation(AppointmentEntity appointment) {
        String message = "Your appointment scheduled for " + appointment.getScheduledAt() + " has been cancelled.";
        sendToBothParties(appointment, NotificationType.APPOINTMENT_CANCELLATION, "Appointment cancelled", message);
    }

    private void notifyConfirmed(AppointmentEntity appointment) {
        String message = "Your appointment for " + appointment.getScheduledAt() + " has been confirmed by the doctor.";
        sendToBothParties(appointment, NotificationType.APPOINTMENT_CONFIRMATION, "Appointment confirmed", message);
    }

    private void notifyRescheduleRequest(AppointmentEntity appointment, String doctorMessage) {
        String message = "Your doctor has requested to reschedule your appointment on "
                + appointment.getScheduledAt() + "."
                + (doctorMessage != null && !doctorMessage.isBlank() ? " Message: " + doctorMessage : "");
        patientProfileRepository.findById(appointment.getPatientId()).ifPresent(patient ->
                notificationService.send(appointment.getTenantId(), patient.getUserId(),
                        NotificationType.APPOINTMENT_CONFIRMATION, "Reschedule requested", message,
                        "Appointment", appointment.getId()));
    }

    private void notifyPostponed(AppointmentEntity appointment) {
        String message = "Your appointment on " + appointment.getScheduledAt() + " has been temporarily postponed.";
        if (appointment.getPostponeReason() != null && !appointment.getPostponeReason().isBlank()) {
            message += " Reason: " + appointment.getPostponeReason();
        }
        sendToBothParties(appointment, NotificationType.APPOINTMENT_CANCELLATION, "Appointment postponed", message);
    }

    private void notifyResumed(AppointmentEntity appointment) {
        String message = "Your postponed appointment for " + appointment.getScheduledAt() + " is active again.";
        sendToBothParties(appointment, NotificationType.APPOINTMENT_CONFIRMATION, "Appointment resumed", message);
    }

    private void notifyReschedule(AppointmentEntity oldAppointment, AppointmentEntity newAppointment) {
        String message = "Your appointment has been rescheduled to " + newAppointment.getScheduledAt() + ".";
        sendToBothParties(newAppointment, NotificationType.APPOINTMENT_CONFIRMATION, "Appointment rescheduled", message);
    }

    private void notifyCompleted(AppointmentEntity appointment) {
        PatientProfileEntity patient = patientProfileRepository.findById(appointment.getPatientId()).orElse(null);
        if (patient == null) {
            return;
        }
        notificationService.send(
                appointment.getTenantId(),
                patient.getUserId(),
                NotificationType.REVIEW_PROMPT,
                "How was your visit?",
                "Your appointment is complete. Share your experience with a review.",
                "Appointment",
                appointment.getId());
    }

    private void sendToBothParties(
            AppointmentEntity appointment,
            NotificationType type,
            String title,
            String message) {
        patientProfileRepository.findById(appointment.getPatientId()).ifPresent(patient ->
                notificationService.send(appointment.getTenantId(), patient.getUserId(),
                        type, title, message, "Appointment", appointment.getId()));
        doctorProfileRepository.findById(appointment.getDoctorId()).ifPresent(doctor ->
                notificationService.send(appointment.getTenantId(), doctor.getUserId(),
                        type, title, message, "Appointment", appointment.getId()));
    }

    private BusinessException notFound() {
        return notFound("Appointment not found");
    }

    private BusinessException notFound(String message) {
        return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }

    public enum ViewContext {
        PATIENT, DOCTOR
    }
}
