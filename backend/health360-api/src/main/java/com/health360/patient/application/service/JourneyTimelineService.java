package com.health360.patient.application.service;

import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.billing.infrastructure.persistence.repository.InvoiceRepository;
import com.health360.clinical.application.service.ClinicalTimelineService;
import com.health360.clinical.domain.PrescriptionStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionRepository;
import com.health360.clinical.presentation.dto.response.ClinicalTimelineItemResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.laboratory.infrastructure.persistence.entity.LabOrderEntity;
import com.health360.laboratory.infrastructure.persistence.repository.LabOrderRepository;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.presentation.dto.response.JourneyTimelineItemResponse;
import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestEntity;
import com.health360.pharmacy.infrastructure.persistence.repository.PharmacyRequestRepository;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * ECO-P6: live-aggregate care journey timeline (appointment → queue → consult → Rx → lab → pharmacy).
 */
@Service
@RequiredArgsConstructor
public class JourneyTimelineService {

    private static final int MAX_APPOINTMENTS = 40;
    private static final int MAX_ENCOUNTERS = 50;

    private final PatientProfileRepository patientProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final EncounterRepository encounterRepository;
    private final OpdQueueEntryRepository queueEntryRepository;
    private final ClinicalTimelineService clinicalTimelineService;
    private final PrescriptionRepository prescriptionRepository;
    private final LabOrderRepository labOrderRepository;
    private final PharmacyRequestRepository pharmacyRequestRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public Page<JourneyTimelineItemResponse> getMyJourneyTimeline(UserPrincipal principal, Pageable pageable) {
        PatientProfileEntity profile = requireConsentedPatient(principal);
        return pageItems(buildItems(principal.getTenantId(), profile.getId()), pageable);
    }

    @Transactional(readOnly = true)
    public List<JourneyTimelineItemResponse> listRecentForPatient(UUID tenantId, UUID patientId, int limit) {
        return buildItems(tenantId, patientId).stream().limit(Math.max(1, limit)).toList();
    }

    private List<JourneyTimelineItemResponse> buildItems(UUID tenantId, UUID patientId) {
        List<JourneyTimelineItemResponse> items = new ArrayList<>();

        List<AppointmentEntity> appointments = appointmentRepository
                .findByPatientIdAndTenantIdAndDeletedAtIsNullOrderByScheduledAtDesc(patientId, tenantId);
        int apptCount = 0;
        for (AppointmentEntity appointment : appointments) {
            if (apptCount++ >= MAX_APPOINTMENTS) {
                break;
            }
            Instant bookedAt = appointment.getCreatedAt() != null
                    ? appointment.getCreatedAt()
                    : appointment.getScheduledAt();
            items.add(item(
                    appointment.getId() + ":APPOINTMENT_BOOKED",
                    "APPOINTMENT",
                    "APPOINTMENT_BOOKED",
                    "Appointment booked (" + appointment.getStatus() + ")",
                    bookedAt,
                    null,
                    "Appointment",
                    appointment.getId(),
                    "/patient/appointments/" + appointment.getId(),
                    Map.of("status", appointment.getStatus(),
                            "scheduledAt", String.valueOf(appointment.getScheduledAt()))));

            if ("ARRIVED".equals(appointment.getStatus()) || "COMPLETED".equals(appointment.getStatus())
                    || "IN_PROGRESS".equals(appointment.getStatus())) {
                Instant arrivedAt = appointment.getUpdatedAt() != null
                        ? appointment.getUpdatedAt()
                        : appointment.getScheduledAt();
                items.add(item(
                        appointment.getId() + ":APPOINTMENT_ARRIVED",
                        "APPOINTMENT",
                        "APPOINTMENT_ARRIVED",
                        "Checked in for appointment",
                        arrivedAt,
                        null,
                        "Appointment",
                        appointment.getId(),
                        "/patient/opd",
                        Map.of("status", appointment.getStatus())));
            }
            if ("COMPLETED".equals(appointment.getStatus())) {
                Instant completedAt = appointment.getUpdatedAt() != null
                        ? appointment.getUpdatedAt()
                        : appointment.getScheduledAt();
                items.add(item(
                        appointment.getId() + ":APPOINTMENT_COMPLETED",
                        "APPOINTMENT",
                        "APPOINTMENT_COMPLETED",
                        "Appointment completed",
                        completedAt,
                        null,
                        "Appointment",
                        appointment.getId(),
                        "/patient/appointments/" + appointment.getId(),
                        Map.of("status", appointment.getStatus())));
            }
        }

        Page<EncounterEntity> encounters = encounterRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        tenantId, patientId, PageRequest.of(0, MAX_ENCOUNTERS));
        List<UUID> encounterIds = encounters.getContent().stream().map(EncounterEntity::getId).toList();
        if (!encounterIds.isEmpty()) {
            for (OpdQueueEntryEntity queue : queueEntryRepository
                    .findByTenantIdAndEncounterIdInAndDeletedAtIsNull(tenantId, encounterIds)) {
                items.add(item(
                        queue.getId() + ":QUEUE_CHECKED_IN",
                        "QUEUE",
                        "QUEUE_CHECKED_IN",
                        "OPD token " + queue.getTokenDisplay() + " issued",
                        queue.getCheckedInAt(),
                        queue.getEncounterId(),
                        "OpdQueueEntry",
                        queue.getId(),
                        "/patient/opd",
                        Map.of("token", queue.getTokenDisplay(), "status", queue.getStatus())));
                if (queue.getCalledAt() != null) {
                    items.add(item(
                            queue.getId() + ":QUEUE_CALLED",
                            "QUEUE",
                            "QUEUE_CALLED",
                            "Token " + queue.getTokenDisplay() + " called",
                            queue.getCalledAt(),
                            queue.getEncounterId(),
                            "OpdQueueEntry",
                            queue.getId(),
                            "/patient/opd",
                            Map.of("token", queue.getTokenDisplay(), "status", queue.getStatus())));
                }
                if (queue.getCompletedAt() != null) {
                    items.add(item(
                            queue.getId() + ":QUEUE_COMPLETED",
                            "QUEUE",
                            "QUEUE_COMPLETED",
                            "Queue visit completed (token " + queue.getTokenDisplay() + ")",
                            queue.getCompletedAt(),
                            queue.getEncounterId(),
                            "OpdQueueEntry",
                            queue.getId(),
                            "/patient/opd",
                            Map.of("token", queue.getTokenDisplay(), "status", queue.getStatus())));
                }
            }
        }

        for (ClinicalTimelineItemResponse clinical : clinicalTimelineService.listItemsForPatient(tenantId, patientId)) {
            items.add(item(
                    "CLINICAL:" + clinical.getEventId(),
                    "CLINICAL",
                    clinical.getEventType(),
                    clinical.getSummary(),
                    clinical.getOccurredAt(),
                    clinical.getEncounterId(),
                    clinical.getReferenceType(),
                    clinical.getReferenceId(),
                    clinical.getEncounterId() != null
                            ? "/patient/encounters/" + clinical.getEncounterId()
                            : "/patient/timeline",
                    clinical.getMetadata() != null ? clinical.getMetadata() : Map.of()));
        }

        for (PrescriptionEntity rx : prescriptionRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(tenantId, patientId)) {
            Instant when = rx.getSignedAt() != null ? rx.getSignedAt() : rx.getCreatedAt();
            String type = PrescriptionStatus.SIGNED.name().equals(rx.getStatus())
                    ? "PRESCRIPTION_SIGNED"
                    : "PRESCRIPTION_" + rx.getStatus();
            items.add(item(
                    rx.getId() + ":" + type,
                    "PHARMACY",
                    type,
                    "Prescription " + rx.getPrescriptionNumber() + " (" + rx.getStatus() + ")",
                    when,
                    rx.getEncounterId(),
                    "Prescription",
                    rx.getId(),
                    rx.getEncounterId() != null
                            ? "/patient/encounters/" + rx.getEncounterId()
                            : "/patient/prescriptions",
                    Map.of("status", rx.getStatus(), "prescriptionNumber", rx.getPrescriptionNumber())));
        }

        for (LabOrderEntity lab : labOrderRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByReceivedAtDesc(tenantId, patientId)) {
            items.add(item(
                    lab.getId() + ":LAB_" + lab.getStatus(),
                    "LAB",
                    "LAB_" + lab.getStatus(),
                    "Lab order " + lab.getStatus().toLowerCase().replace('_', ' '),
                    lab.getReceivedAt() != null ? lab.getReceivedAt() : lab.getCreatedAt(),
                    lab.getEncounterId(),
                    "LabOrder",
                    lab.getId(),
                    "/patient/lab-values",
                    Map.of("status", lab.getStatus())));
        }

        for (PharmacyRequestEntity request : pharmacyRequestRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByRequestedAtDesc(tenantId, patientId)) {
            Instant when = request.getDispensedAt() != null ? request.getDispensedAt()
                    : request.getReadyAt() != null ? request.getReadyAt()
                    : request.getRequestedAt();
            items.add(item(
                    request.getId() + ":PHARMACY_REQUEST_" + request.getStatus(),
                    "PHARMACY",
                    "PHARMACY_REQUEST_" + request.getStatus(),
                    "Pharmacy request " + request.getRequestNumber() + " — " + request.getStatus(),
                    when,
                    request.getEncounterId(),
                    "PharmacyRequest",
                    request.getId(),
                    "/patient/prescriptions",
                    Map.of("status", request.getStatus(), "requestNumber", request.getRequestNumber())));
        }

        for (InvoiceEntity invoice : invoiceRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByIssuedAtDesc(
                        tenantId, patientId, PageRequest.of(0, 40))) {
            Instant when = invoice.getIssuedAt() != null ? invoice.getIssuedAt() : invoice.getCreatedAt();
            String eventType = "PAID".equals(invoice.getStatus()) ? "INVOICE_PAID" : "INVOICE_ISSUED";
            String summary = "PAID".equals(invoice.getStatus())
                    ? "Payment received · " + invoice.getInvoiceNumber()
                    : "Invoice issued · " + invoice.getInvoiceNumber();
            items.add(item(
                    invoice.getId() + ":" + eventType,
                    "BILLING",
                    eventType,
                    summary,
                    when,
                    invoice.getEncounterId(),
                    "Invoice",
                    invoice.getId(),
                    "/patient/payments",
                    Map.of("status", invoice.getStatus(), "invoiceNumber", invoice.getInvoiceNumber())));
        }

        items.sort(Comparator.comparing(JourneyTimelineItemResponse::getOccurredAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return items;
    }

    private PatientProfileEntity requireConsentedPatient(UserPrincipal principal) {
        PatientProfileEntity profile = patientProfileRepository
                .findByTenantIdAndUserIdAndDeletedAtIsNull(principal.getTenantId(), principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient profile not found"));
        if (!profile.isConsentAccepted()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Health data consent must be accepted before accessing journey timeline");
        }
        return profile;
    }

    private Page<JourneyTimelineItemResponse> pageItems(List<JourneyTimelineItemResponse> items, Pageable pageable) {
        int start = (int) pageable.getOffset();
        if (start >= items.size()) {
            return new PageImpl<>(List.of(), pageable, items.size());
        }
        int end = Math.min(start + pageable.getPageSize(), items.size());
        return new PageImpl<>(items.subList(start, end), pageable, items.size());
    }

    private JourneyTimelineItemResponse item(
            String eventId,
            String domain,
            String eventType,
            String summary,
            Instant occurredAt,
            UUID encounterId,
            String referenceType,
            UUID referenceId,
            String deepLink,
            Map<String, Object> metadata) {
        Map<String, Object> meta = metadata != null ? new HashMap<>(metadata) : new HashMap<>();
        return JourneyTimelineItemResponse.builder()
                .eventId(eventId)
                .domain(domain)
                .eventType(eventType)
                .summary(summary)
                .occurredAt(occurredAt != null ? occurredAt : Instant.now())
                .encounterId(encounterId)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .deepLink(deepLink)
                .metadata(meta)
                .build();
    }
}
