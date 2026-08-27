package com.health360.opd.application.service;

import com.health360.clinical.domain.EncounterStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.config.security.UserPrincipal;
import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.opd.domain.QueueEntryStatus;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.shared.application.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OpdVisitStatusSyncServiceTest {

    @Mock
    private OpdQueueEntryRepository queueEntryRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private PatientProfileRepository patientProfileRepository;
    @Mock
    private TransactionalNotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private OpdVisitStatusSyncService syncService;

    private final UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final UUID encounterId = UUID.fromString("00000000-0000-0000-0000-000000000111");
    private final UUID appointmentId = UUID.fromString("00000000-0000-0000-0000-000000000222");

    @Test
    void doctorStartMovesWaitingQueueToInService() {
        EncounterEntity encounter = encounter();
        OpdQueueEntryEntity entry = queue("WAITING");
        when(queueEntryRepository.findByTenantIdAndEncounterIdAndDeletedAtIsNull(tenantId, encounterId))
                .thenReturn(Optional.of(entry));

        syncService.syncFromEncounter(principal(), encounter, EncounterStatus.IN_PROGRESS);

        ArgumentCaptor<OpdQueueEntryEntity> captor = ArgumentCaptor.forClass(OpdQueueEntryEntity.class);
        verify(queueEntryRepository).save(captor.capture());
        assertEquals(QueueEntryStatus.IN_SERVICE.name(), captor.getValue().getStatus());
        verify(appointmentRepository, never()).findByIdAndTenantIdAndDeletedAtIsNull(any(), any());
    }

    @Test
    void doctorCompleteClosesQueueAndAppointment() {
        EncounterEntity encounter = encounter();
        encounter.setAppointmentId(appointmentId);
        OpdQueueEntryEntity entry = queue("IN_SERVICE");
        AppointmentEntity appointment = new AppointmentEntity();
        appointment.setStatus("ARRIVED");
        when(queueEntryRepository.findByTenantIdAndEncounterIdAndDeletedAtIsNull(tenantId, encounterId))
                .thenReturn(Optional.of(entry));
        when(appointmentRepository.findByIdAndTenantIdAndDeletedAtIsNull(appointmentId, tenantId))
                .thenReturn(Optional.of(appointment));

        syncService.syncFromEncounter(principal(), encounter, EncounterStatus.COMPLETED);

        assertEquals(QueueEntryStatus.COMPLETED.name(), entry.getStatus());
        assertEquals("COMPLETED", appointment.getStatus());
        verify(queueEntryRepository).save(entry);
        verify(appointmentRepository).save(appointment);
    }

    @Test
    void doesNotOverwriteCompletedQueueWhenDoctorStarts() {
        EncounterEntity encounter = encounter();
        OpdQueueEntryEntity entry = queue("COMPLETED");
        when(queueEntryRepository.findByTenantIdAndEncounterIdAndDeletedAtIsNull(tenantId, encounterId))
                .thenReturn(Optional.of(entry));

        syncService.syncFromEncounter(principal(), encounter, EncounterStatus.IN_PROGRESS);

        verify(queueEntryRepository, never()).save(any());
    }

    private EncounterEntity encounter() {
        EncounterEntity encounter = new EncounterEntity();
        encounter.setId(encounterId);
        encounter.setPatientId(UUID.fromString("00000000-0000-0000-0000-000000000070"));
        return encounter;
    }

    private OpdQueueEntryEntity queue(String status) {
        OpdQueueEntryEntity entry = new OpdQueueEntryEntity();
        entry.setId(UUID.fromString("00000000-0000-0000-0000-000000000333"));
        entry.setEncounterId(encounterId);
        entry.setStatus(status);
        return entry;
    }

    private UserPrincipal principal() {
        return new UserPrincipal(
                UUID.fromString("00000000-0000-0000-0000-000000000010"),
                tenantId,
                "doctor@health360.test",
                "test-jti",
                List.of("DOCTOR"),
                List.of("clinical:encounter:write"));
    }
}
