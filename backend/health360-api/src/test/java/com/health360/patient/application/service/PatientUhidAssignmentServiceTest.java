package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.application.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientUhidAssignmentServiceTest {

  private static final UUID TENANT_ID = UUID.randomUUID();
  private static final UUID ACTOR_ID = UUID.randomUUID();

  @Mock
  private PatientProfileRepository patientProfileRepository;

  @Mock
  private UhidGenerationService uhidGenerationService;

  @Mock
  private AuditLogService auditLogService;

  @InjectMocks
  private PatientUhidAssignmentService service;

  @Test
  void ensureAssigned_allocatesWhenMissing() {
    PatientProfileEntity profile = new PatientProfileEntity();
    profile.setId(UUID.randomUUID());
    profile.setTenantId(TENANT_ID);
    profile.setUserId(UUID.randomUUID());

    when(uhidGenerationService.allocateUhid(TENANT_ID)).thenReturn("H360-2026-00000042");
    when(patientProfileRepository.save(profile)).thenAnswer(invocation -> invocation.getArgument(0));

    PatientProfileEntity result = service.ensureAssigned(profile, ACTOR_ID);

    assertThat(result.getUhid()).isEqualTo("H360-2026-00000042");
    verify(uhidGenerationService).allocateUhid(TENANT_ID);
    verify(auditLogService).record(eq(TENANT_ID), eq(ACTOR_ID), eq("UHID_ASSIGNED"),
        eq("PatientProfile"), eq(profile.getId()), any());
  }

  @Test
  void ensureAssigned_skipsWhenPresent() {
    PatientProfileEntity profile = new PatientProfileEntity();
    profile.setUhid("H360-2026-00000001");

    PatientProfileEntity result = service.ensureAssigned(profile, ACTOR_ID);

    assertThat(result.getUhid()).isEqualTo("H360-2026-00000001");
    verify(uhidGenerationService, never()).allocateUhid(any());
    verify(patientProfileRepository, never()).save(any());
  }
}
