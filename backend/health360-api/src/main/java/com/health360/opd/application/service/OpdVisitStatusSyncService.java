package com.health360.opd.application.service;

import com.health360.clinical.domain.EncounterStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.config.security.UserPrincipal;
import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.iam.domain.NotificationType;
import com.health360.opd.domain.QueueEntryStatus;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.shared.application.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Keeps OPD queue + appointment aligned with the encounter (visit hub).
 * Queue desk actions already update the encounter; this covers the reverse
 * (doctor start/complete) so hospital and reception see the same visit.
 */
@Service
@RequiredArgsConstructor
public class OpdVisitStatusSyncService {

    private static final Set<String> APPOINTMENT_COMPLETABLE =
            Set.of("PENDING", "CONFIRMED", "ARRIVED", "POSTPONED");
    private static final Set<String> QUEUE_TERMINAL =
            Set.of(QueueEntryStatus.COMPLETED.name(), QueueEntryStatus.CANCELLED.name(),
                    QueueEntryStatus.NO_SHOW.name());

    private final OpdQueueEntryRepository queueEntryRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final TransactionalNotificationService notificationService;
    private final AuditLogService auditLogService;

    public void syncFromEncounter(UserPrincipal principal, EncounterEntity encounter, EncounterStatus target) {
        queueEntryRepository
                .findByTenantIdAndEncounterIdAndDeletedAtIsNull(principal.getTenantId(), encounter.getId())
                .ifPresent(entry -> applyQueue(principal, encounter, entry, target));
        if (target == EncounterStatus.COMPLETED) {
            completeLinkedAppointment(principal, encounter);
        }
    }

    private void applyQueue(
            UserPrincipal principal,
            EncounterEntity encounter,
            OpdQueueEntryEntity entry,
            EncounterStatus target) {
        QueueEntryStatus desired = switch (target) {
            case IN_PROGRESS -> QueueEntryStatus.IN_SERVICE;
            case COMPLETED -> QueueEntryStatus.COMPLETED;
            case CANCELLED -> QueueEntryStatus.CANCELLED;
            default -> null;
        };
        if (desired == null) {
            return;
        }
        if (QUEUE_TERMINAL.contains(entry.getStatus()) && !desired.name().equals(entry.getStatus())) {
            return;
        }
        if (desired.name().equals(entry.getStatus())) {
            return;
        }

        Instant now = Instant.now();
        entry.setStatus(desired.name());
        entry.setUpdatedBy(principal.getUserId());
        if (desired == QueueEntryStatus.IN_SERVICE) {
            if (entry.getCalledAt() == null) {
                entry.setCalledAt(now);
            }
            if (entry.getServiceStartedAt() == null) {
                entry.setServiceStartedAt(now);
            }
        }
        if (desired == QueueEntryStatus.COMPLETED && entry.getCompletedAt() == null) {
            entry.setCompletedAt(now);
        }
        queueEntryRepository.save(entry);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "OPD_QUEUE_SYNCED_FROM_ENCOUNTER", "OpdQueueEntry", entry.getId(),
                Map.of("queueStatus", desired.name(), "encounterStatus", target.name()));

        notifyPatientQueueStatus(principal.getTenantId(), encounter, desired);
    }

    private void completeLinkedAppointment(UserPrincipal principal, EncounterEntity encounter) {
        UUID appointmentId = encounter.getAppointmentId();
        if (appointmentId == null) {
            return;
        }
        appointmentRepository.findByIdAndTenantIdAndDeletedAtIsNull(appointmentId, principal.getTenantId())
                .ifPresent(appointment -> markAppointmentCompleted(principal, appointment));
    }

    private void markAppointmentCompleted(UserPrincipal principal, AppointmentEntity appointment) {
        if (!APPOINTMENT_COMPLETABLE.contains(appointment.getStatus())) {
            return;
        }
        Instant now = Instant.now();
        appointment.setStatus("COMPLETED");
        appointment.setCompletedAt(now);
        appointment.setUpdatedBy(principal.getUserId());
        appointmentRepository.save(appointment);
        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "APPOINTMENT_STATUS_UPDATED", "Appointment", appointment.getId(),
                Map.of("status", "COMPLETED", "source", "ENCOUNTER_COMPLETE"));
    }

    private void notifyPatientQueueStatus(UUID tenantId, EncounterEntity encounter, QueueEntryStatus status) {
        NotificationType type;
        String title;
        String message;
        switch (status) {
            case IN_SERVICE -> {
                type = NotificationType.OPD_IN_SERVICE;
                title = "Consultation in progress";
                message = "Your consultation has started.";
            }
            case COMPLETED -> {
                type = NotificationType.OPD_COMPLETED;
                title = "Consultation completed";
                message = "Your consultation is complete.";
            }
            default -> {
                return;
            }
        }
        patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounter.getPatientId(), tenantId)
                .ifPresent(patient -> {
                    if (patient.getUserId() != null) {
                        notificationService.send(
                                tenantId, patient.getUserId(), type, title, message,
                                "OpdQueueEntry", encounter.getId());
                    }
                });
    }
}
