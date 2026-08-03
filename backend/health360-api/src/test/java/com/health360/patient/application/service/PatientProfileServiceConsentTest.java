package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.*;
import com.health360.patient.presentation.dto.request.ConsentRequest;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientProfileServiceConsentTest {

    @Mock private PatientProfileRepository profileRepository;
    @Mock private AllergyRepository allergyRepository;
    @Mock private MedicationRepository medicationRepository;
    @Mock private SurgeryRepository surgeryRepository;
    @Mock private ChronicConditionRepository chronicConditionRepository;
    @Mock private EmergencyContactRepository emergencyContactRepository;
    @Mock private PhysicalMeasurementHistoryRepository measurementHistoryRepository;
    @Mock private VitalSignRecordRepository vitalSignRecordRepository;
    @Mock private PatientProfileMapper mapper;
    @Mock private ProfileCompletionCalculator completionCalculator;
    @Mock private AuditLogService auditLogService;
    @Mock private com.health360.analytics.application.service.MetricsRecalculationService metricsRecalculationService;

    @InjectMocks
    private PatientProfileService patientProfileService;

    @Test
    void acceptConsent_persistsProfileBeforeWritingAuditLog() {
        UUID userId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        ConsentRequest request = new ConsentRequest();
        request.setAccepted(true);

        when(profileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId))
                .thenReturn(Optional.empty());
        when(profileRepository.saveAndFlush(any(PatientProfileEntity.class))).thenAnswer(invocation -> {
            PatientProfileEntity entity = invocation.getArgument(0);
            entity.setId(profileId);
            return entity;
        });
        when(allergyRepository.findByPatientIdAndDeletedAtIsNullOrderByName(profileId)).thenReturn(List.of());
        when(medicationRepository.findByPatientIdAndDeletedAtIsNullOrderByName(profileId)).thenReturn(List.of());
        when(surgeryRepository.findByPatientIdAndDeletedAtIsNullOrderBySurgeryDateDesc(profileId)).thenReturn(List.of());
        when(chronicConditionRepository.findByPatientIdAndDeletedAtIsNullOrderByConditionName(profileId))
                .thenReturn(List.of());
        when(emergencyContactRepository.findByPatientIdAndDeletedAtIsNullOrderByName(profileId)).thenReturn(List.of());
        when(mapper.toFullResponse(any(), anyList(), anyList(), anyList(), anyList(), anyList()))
                .thenReturn(com.health360.patient.presentation.dto.response.PatientProfileResponse.builder()
                        .id(profileId)
                        .consentAccepted(true)
                        .completionScore(0)
                        .build());

        patientProfileService.acceptConsent(userId, tenantId, request);

        ArgumentCaptor<UUID> entityIdCaptor = ArgumentCaptor.forClass(UUID.class);
        verify(profileRepository).saveAndFlush(any(PatientProfileEntity.class));
        verify(auditLogService).record(eq(tenantId), eq(userId), eq("PATIENT_CONSENT_ACCEPTED"),
                eq("PatientProfile"), entityIdCaptor.capture(), eq(java.util.Map.of()));
        assertThat(entityIdCaptor.getValue()).isEqualTo(profileId);
    }
}
