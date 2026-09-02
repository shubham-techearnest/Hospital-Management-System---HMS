package com.health360.opd.application.service;

import com.health360.billing.infrastructure.persistence.repository.InvoiceRepository;
import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.response.EncounterResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.patient.application.service.HospitalRegistrationLinker;
import com.health360.patient.application.service.PatientDisplayNameResolver;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.scheduling.presentation.dto.response.AppointmentArrivalResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OpdRegistrationSelfCheckInTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private EncounterRepository encounterRepository;
    @Mock private OpdQueueEntryRepository queueEntryRepository;
    @Mock private EncounterService encounterService;
    @Mock private OpdDeskService deskService;
    @Mock private OpdAccessService opdAccessService;
    @Mock private OpdMapper opdMapper;
    @Mock private AuditLogService auditLogService;
    @Mock private PatientProfileRepository patientProfileRepository;
    @Mock private PatientDisplayNameResolver patientDisplayNameResolver;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private HospitalRegistrationLinker hospitalRegistrationLinker;

    @InjectMocks
    private OpdRegistrationService registrationService;

    private final UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private final UUID patientId = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private final UUID appointmentId = UUID.fromString("00000000-0000-0000-0000-000000000090");
    private final UUID hospitalId = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private final UUID branchId = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private UserPrincipal principal;
    private PatientProfileEntity profile;
    private AppointmentEntity appointment;

    @BeforeEach
    void setUp() {
        principal = new UserPrincipal(
                userId, tenantId, "patient@example.com", "jti",
                List.of("PATIENT"), List.of("opd:checkin:own"));
        profile = new PatientProfileEntity();
        profile.setId(patientId);
        profile.setTenantId(tenantId);
        profile.setUserId(userId);

        appointment = new AppointmentEntity();
        appointment.setId(appointmentId);
        appointment.setTenantId(tenantId);
        appointment.setPatientId(patientId);
        appointment.setHospitalId(hospitalId);
        appointment.setBranchId(branchId);
        appointment.setDoctorId(UUID.fromString("00000000-0000-0000-0000-000000000060"));
        appointment.setStatus("CONFIRMED");
        appointment.setScheduledAt(LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC));
    }

    @Test
    void selfCheckInArrivesAndCreatesEncounterQueue() {
        doNothing().when(opdAccessService).assertCanSelfCheckIn(principal);
        when(patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId))
                .thenReturn(Optional.of(profile));
        when(appointmentRepository.findByIdForUpdate(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(AppointmentEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(encounterRepository.findByTenantIdAndAppointmentIdAndDeletedAtIsNull(tenantId, appointmentId))
                .thenReturn(Optional.empty());

        UUID encounterId = UUID.fromString("00000000-0000-0000-0000-000000000091");
        EncounterResponse encounterResponse = EncounterResponse.builder()
                .encounterId(encounterId)
                .status("WAITING")
                .build();
        when(encounterService.createEncounterForRegistration(eq(principal), any()))
                .thenReturn(encounterResponse);
        when(encounterService.markWaitingForRegistration(principal, encounterId))
                .thenReturn(encounterResponse);
        when(queueEntryRepository.findMaxTokenNumberForDay(eq(hospitalId), eq(branchId), any()))
                .thenReturn(0);
        when(queueEntryRepository.save(any(OpdQueueEntryEntity.class))).thenAnswer(inv -> {
            OpdQueueEntryEntity entry = inv.getArgument(0);
            entry.setId(UUID.fromString("00000000-0000-0000-0000-000000000092"));
            return entry;
        });

        EncounterEntity encounterEntity = new EncounterEntity();
        encounterEntity.setId(encounterId);
        when(encounterRepository.findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId))
                .thenReturn(Optional.of(encounterEntity));
        when(patientProfileRepository.findByIdAndTenantIdAndDeletedAtIsNull(patientId, tenantId))
                .thenReturn(Optional.of(profile));
        when(invoiceRepository.findFirstByTenantIdAndEncounterIdAndDeletedAtIsNullAndStatusNotOrderByIssuedAtDesc(
                eq(tenantId), eq(encounterId), any())).thenReturn(Optional.empty());
        when(opdMapper.toEncounterResponse(any(), any(), any())).thenReturn(encounterResponse);
        when(opdMapper.toQueueEntryResponse(any(), any(), any(), any(), any(), any())).thenAnswer(inv -> null);

        AppointmentArrivalResponse response = registrationService.selfCheckIn(principal, appointmentId);

        assertEquals("ARRIVED", response.getAppointmentStatus());
        assertEquals(appointmentId, response.getAppointmentId());
        verify(opdAccessService, never()).assertHospitalScope(any(), any());
        verify(opdAccessService, never()).assertCanManageRegistration(any());
    }

    @Test
    void selfCheckInRejectsOtherDay() {
        doNothing().when(opdAccessService).assertCanSelfCheckIn(principal);
        when(patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId))
                .thenReturn(Optional.of(profile));
        appointment.setScheduledAt(Instant.parse("2020-01-01T10:00:00Z"));
        when(appointmentRepository.findByIdForUpdate(appointmentId)).thenReturn(Optional.of(appointment));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> registrationService.selfCheckIn(principal, appointmentId));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getCode());
    }

    @Test
    void selfCheckInRejectsOtherPatient() {
        doNothing().when(opdAccessService).assertCanSelfCheckIn(principal);
        when(patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId))
                .thenReturn(Optional.of(profile));
        appointment.setPatientId(UUID.fromString("00000000-0000-0000-0000-000000000099"));
        when(appointmentRepository.findByIdForUpdate(appointmentId)).thenReturn(Optional.of(appointment));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> registrationService.selfCheckIn(principal, appointmentId));
        assertEquals(ErrorCode.FORBIDDEN, ex.getCode());
    }
}
