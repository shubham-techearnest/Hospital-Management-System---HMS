package com.health360.patient.application.service;

import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlatformPatientLookupServiceTest {

  private static final UUID TENANT_ID = UUID.randomUUID();

  @Mock
  private PatientProfileRepository patientProfileRepository;

  @Mock
  private UserRepository userRepository;

  @Mock
  private PatientUhidAssignmentService patientUhidAssignmentService;

  @InjectMocks
  private PlatformPatientLookupService service;

  @Test
  void resolveProfilesByMobile_provisionsProfileForAppUserWithoutPatientRow() {
    UUID userId = UUID.randomUUID();
    UserEntity user = new UserEntity();
    user.setId(userId);
    user.setTenantId(TENANT_ID);
    user.setFirstName("Ravi");
    user.setLastName("Kulkarni");
    user.setPhone("9876543210");

    when(patientProfileRepository.findByTenantIdAndPhoneLast10(TENANT_ID, "9876543210"))
        .thenReturn(List.of());
    when(userRepository.findPatientUsersByPhoneLast10(TENANT_ID, "9876543210"))
        .thenReturn(List.of(user));
    when(patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(TENANT_ID, userId))
        .thenReturn(Optional.empty());
    when(patientProfileRepository.save(any(PatientProfileEntity.class))).thenAnswer(invocation -> {
      PatientProfileEntity saved = invocation.getArgument(0);
      saved.setId(UUID.randomUUID());
      return saved;
    });
    when(patientUhidAssignmentService.ensureAssigned(any(PatientProfileEntity.class), any()))
        .thenAnswer(invocation -> invocation.getArgument(0));

    List<PatientProfileEntity> results = service.resolveProfilesByMobile(TENANT_ID, "+91 98765 43210", UUID.randomUUID());

    assertThat(results).hasSize(1);
    assertThat(results.get(0).getLegalFirstName()).isEqualTo("Ravi");
    assertThat(results.get(0).getPrimaryPhone()).isEqualTo("+919876543210");
    verify(patientProfileRepository).save(any(PatientProfileEntity.class));
  }

  @Test
  void resolveProfilesByMobile_reusesExistingProfile() {
    UUID profileId = UUID.randomUUID();
    PatientProfileEntity profile = new PatientProfileEntity();
    profile.setId(profileId);
    profile.setTenantId(TENANT_ID);
    profile.setPrimaryPhone("+919876543210");

    when(patientProfileRepository.findByTenantIdAndPhoneLast10(TENANT_ID, "9876543210"))
        .thenReturn(List.of(profile));
    when(userRepository.findPatientUsersByPhoneLast10(TENANT_ID, "9876543210"))
        .thenReturn(List.of());
    when(patientUhidAssignmentService.ensureAssigned(any(PatientProfileEntity.class), any()))
        .thenAnswer(invocation -> invocation.getArgument(0));

    List<PatientProfileEntity> results = service.resolveProfilesByMobile(TENANT_ID, "9876543210", UUID.randomUUID());

    assertThat(results).containsExactly(profile);
    verify(patientProfileRepository, never()).save(any());
  }
}
