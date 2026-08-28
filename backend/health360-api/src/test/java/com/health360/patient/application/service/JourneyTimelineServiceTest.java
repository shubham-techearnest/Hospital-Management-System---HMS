package com.health360.patient.application.service;

import com.health360.clinical.application.service.ClinicalTimelineService;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.laboratory.infrastructure.persistence.repository.LabOrderRepository;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.presentation.dto.response.JourneyTimelineItemResponse;
import com.health360.pharmacy.infrastructure.persistence.repository.PharmacyRequestRepository;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JourneyTimelineServiceTest {

    @Mock private PatientProfileRepository patientProfileRepository;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private EncounterRepository encounterRepository;
    @Mock private OpdQueueEntryRepository queueEntryRepository;
    @Mock private ClinicalTimelineService clinicalTimelineService;
    @Mock private PrescriptionRepository prescriptionRepository;
    @Mock private LabOrderRepository labOrderRepository;
    @Mock private PharmacyRequestRepository pharmacyRequestRepository;

    @InjectMocks
    private JourneyTimelineService journeyTimelineService;

    private final UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private final UUID patientId = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private UserPrincipal principal;
    private PatientProfileEntity profile;

    @BeforeEach
    void setUp() {
        principal = new UserPrincipal(
                userId, tenantId, "patient@example.com", "jti",
                List.of("PATIENT"), List.of("patient:profile:read"));
        profile = new PatientProfileEntity();
        profile.setId(patientId);
        profile.setTenantId(tenantId);
        profile.setUserId(userId);
        profile.setConsentAccepted(true);
    }

    @Test
    void journeyIncludesBookedAppointment() {
        when(patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId))
                .thenReturn(Optional.of(profile));

        AppointmentEntity appointment = new AppointmentEntity();
        appointment.setId(UUID.fromString("00000000-0000-0000-0000-000000000090"));
        appointment.setStatus("CONFIRMED");
        appointment.setScheduledAt(Instant.parse("2026-08-27T10:00:00Z"));
        appointment.setCreatedAt(Instant.parse("2026-08-20T10:00:00Z"));

        when(appointmentRepository.findByPatientIdAndTenantIdAndDeletedAtIsNullOrderByScheduledAtDesc(
                patientId, tenantId)).thenReturn(List.of(appointment));
        when(encounterRepository.findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                eq(tenantId), eq(patientId), any())).thenReturn(new PageImpl<>(List.of()));
        when(clinicalTimelineService.listItemsForPatient(tenantId, patientId)).thenReturn(List.of());
        when(prescriptionRepository.findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                tenantId, patientId)).thenReturn(List.of());
        when(labOrderRepository.findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByReceivedAtDesc(
                tenantId, patientId)).thenReturn(List.of());
        when(pharmacyRequestRepository.findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByRequestedAtDesc(
                tenantId, patientId)).thenReturn(List.of());

        var page = journeyTimelineService.getMyJourneyTimeline(principal, PageRequest.of(0, 20));

        assertEquals(1, page.getTotalElements());
        JourneyTimelineItemResponse item = page.getContent().get(0);
        assertEquals("APPOINTMENT", item.getDomain());
        assertEquals("APPOINTMENT_BOOKED", item.getEventType());
        assertTrue(item.getDeepLink().contains("/patient/appointments/"));
    }
}
