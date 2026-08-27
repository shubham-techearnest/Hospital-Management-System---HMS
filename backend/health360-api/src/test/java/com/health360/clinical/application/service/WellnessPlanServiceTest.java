package com.health360.clinical.application.service;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalFollowupEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterWellnessPlanEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalFollowupRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterWellnessPlanRepository;
import com.health360.clinical.presentation.dto.request.UpsertWellnessPlanRequest;
import com.health360.clinical.presentation.dto.response.WellnessPlanResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.application.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WellnessPlanServiceTest {

    @Mock
    private EncounterWellnessPlanRepository wellnessPlanRepository;
    @Mock
    private ClinicalFollowupRepository followupRepository;
    @Mock
    private EncounterRepository encounterRepository;
    @Mock
    private EncounterAccessService accessService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private WellnessPlanService wellnessPlanService;

    private final UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private final UUID encounterId = UUID.fromString("00000000-0000-0000-0000-000000000111");
    private final UUID patientId = UUID.fromString("00000000-0000-0000-0000-000000000222");
    private UserPrincipal principal;
    private EncounterEntity encounter;

    @BeforeEach
    void setUp() {
        principal = new UserPrincipal(
                userId, tenantId, "doc@example.com", "jti",
                List.of("DOCTOR"), List.of("clinical:encounter:write"));
        encounter = new EncounterEntity();
        encounter.setId(encounterId);
        encounter.setTenantId(tenantId);
        encounter.setPatientId(patientId);
        encounter.setHospitalId(UUID.fromString("00000000-0000-0000-0000-000000000333"));
        encounter.setBranchId(UUID.fromString("00000000-0000-0000-0000-000000000444"));
        encounter.setPrimaryDoctorId(UUID.fromString("00000000-0000-0000-0000-000000000555"));
        when(encounterRepository.findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId))
                .thenReturn(Optional.of(encounter));
    }

    @Test
    void getWellnessPlanReturnsEmptyWhenNoneSaved() {
        doNothing().when(accessService).assertCanReadEncounter(principal, encounter);
        when(wellnessPlanRepository.findByEncounterIdAndDeletedAtIsNull(encounterId))
                .thenReturn(Optional.empty());

        WellnessPlanResponse response = wellnessPlanService.getWellnessPlan(principal, encounterId);

        assertEquals(encounterId, response.getEncounterId());
        assertEquals(patientId, response.getPatientId());
        assertNull(response.getWellnessPlanId());
        assertNull(response.getDiet());
    }

    @Test
    void upsertCreatesPlanAndPendingFollowup() {
        doNothing().when(accessService).assertCanWriteEncounter(principal, encounter);
        when(wellnessPlanRepository.findByEncounterIdAndDeletedAtIsNull(encounterId))
                .thenReturn(Optional.empty());
        when(wellnessPlanRepository.save(any(EncounterWellnessPlanEntity.class))).thenAnswer(inv -> {
            EncounterWellnessPlanEntity saved = inv.getArgument(0);
            saved.setId(UUID.fromString("00000000-0000-0000-0000-000000000666"));
            return saved;
        });
        when(followupRepository.findFirstByEncounterIdAndDeletedAtIsNullOrderByCreatedAtDesc(encounterId))
                .thenReturn(Optional.empty());
        when(followupRepository.save(any(ClinicalFollowupEntity.class))).thenAnswer(inv -> {
            ClinicalFollowupEntity saved = inv.getArgument(0);
            saved.setId(UUID.fromString("00000000-0000-0000-0000-000000000777"));
            return saved;
        });

        UpsertWellnessPlanRequest request = new UpsertWellnessPlanRequest();
        request.setDiet("Hydration, light meals");
        request.setFollowUpDate(LocalDate.of(2026, 8, 30));
        request.setFollowUpReason("Review fever");

        WellnessPlanResponse response = wellnessPlanService.upsertWellnessPlan(principal, encounterId, request);

        assertEquals("Hydration, light meals", response.getDiet());
        assertEquals(LocalDate.of(2026, 8, 30), response.getFollowUpDate());
        assertEquals("PENDING", response.getFollowUpStatus());
        assertEquals("Review fever", response.getFollowUpReason());

        ArgumentCaptor<ClinicalFollowupEntity> followupCaptor = ArgumentCaptor.forClass(ClinicalFollowupEntity.class);
        verify(followupRepository).save(followupCaptor.capture());
        assertEquals("PENDING", followupCaptor.getValue().getStatus());
        verify(auditLogService).record(eq(tenantId), eq(userId), eq("WELLNESS_PLAN_UPSERTED"),
                eq("EncounterWellnessPlan"), any(), any());
    }

    @Test
    void upsertClearsFollowUpDateCancelsPendingFollowup() {
        doNothing().when(accessService).assertCanWriteEncounter(principal, encounter);

        EncounterWellnessPlanEntity existingPlan = new EncounterWellnessPlanEntity();
        existingPlan.setId(UUID.fromString("00000000-0000-0000-0000-000000000666"));
        existingPlan.setEncounterId(encounterId);
        existingPlan.setPatientId(patientId);
        existingPlan.setDiet("Old diet");
        when(wellnessPlanRepository.findByEncounterIdAndDeletedAtIsNull(encounterId))
                .thenReturn(Optional.of(existingPlan));
        when(wellnessPlanRepository.save(any(EncounterWellnessPlanEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        ClinicalFollowupEntity existingFollowup = new ClinicalFollowupEntity();
        existingFollowup.setId(UUID.fromString("00000000-0000-0000-0000-000000000777"));
        existingFollowup.setStatus("PENDING");
        existingFollowup.setFollowUpDate(LocalDate.of(2026, 8, 30));
        when(followupRepository.findFirstByEncounterIdAndDeletedAtIsNullOrderByCreatedAtDesc(encounterId))
                .thenReturn(Optional.of(existingFollowup));
        when(followupRepository.save(any(ClinicalFollowupEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        UpsertWellnessPlanRequest request = new UpsertWellnessPlanRequest();
        request.setDiet("Updated diet");
        request.setFollowUpDate(null);

        WellnessPlanResponse response = wellnessPlanService.upsertWellnessPlan(principal, encounterId, request);

        assertEquals("Updated diet", response.getDiet());
        assertEquals("CANCELLED", response.getFollowUpStatus());
        assertEquals("CANCELLED", existingFollowup.getStatus());
    }
}
