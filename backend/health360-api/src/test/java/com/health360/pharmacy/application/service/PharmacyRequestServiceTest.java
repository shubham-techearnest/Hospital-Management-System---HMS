package com.health360.pharmacy.application.service;

import com.health360.clinical.domain.PrescriptionStatus;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionEntity;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionItemEntity;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.pharmacy.domain.PharmacyRequestStatus;
import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestEntity;
import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestItemEntity;
import com.health360.pharmacy.infrastructure.persistence.repository.PharmacyRequestItemRepository;
import com.health360.pharmacy.infrastructure.persistence.repository.PharmacyRequestRepository;
import com.health360.pharmacy.presentation.dto.response.PharmacyRequestResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PharmacyRequestServiceTest {

    @Mock private PharmacyRequestRepository requestRepository;
    @Mock private PharmacyRequestItemRepository requestItemRepository;
    @Mock private PrescriptionRepository prescriptionRepository;
    @Mock private PrescriptionItemRepository prescriptionItemRepository;
    @Mock private PatientProfileRepository patientProfileRepository;
    @Mock private PharmacyAccessService accessService;
    @Mock private AuditLogService auditLogService;
    @Mock private TransactionalNotificationService notificationService;

    @InjectMocks
    private PharmacyRequestService pharmacyRequestService;

    private final UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private final UUID patientId = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private final UUID prescriptionId = UUID.fromString("00000000-0000-0000-0000-000000000080");
    private UserPrincipal principal;
    private PatientProfileEntity profile;
    private PrescriptionEntity prescription;

    @BeforeEach
    void setUp() {
        principal = new UserPrincipal(
                userId, tenantId, "patient@example.com", "jti",
                List.of("PATIENT"), List.of("pharmacy:request:write", "pharmacy:request:read"));
        profile = new PatientProfileEntity();
        profile.setId(patientId);
        profile.setTenantId(tenantId);
        profile.setUserId(userId);
        profile.setUhid("UHID-1");
        profile.setLegalFirstName("Test");
        profile.setLegalLastName("Patient");

        prescription = new PrescriptionEntity();
        prescription.setId(prescriptionId);
        prescription.setTenantId(tenantId);
        prescription.setPatientId(patientId);
        prescription.setEncounterId(UUID.fromString("00000000-0000-0000-0000-000000000081"));
        prescription.setHospitalId(UUID.fromString("00000000-0000-0000-0000-000000000030"));
        prescription.setBranchId(UUID.fromString("00000000-0000-0000-0000-000000000031"));
        prescription.setPrescriptionNumber("RX-2026-00001");
        prescription.setStatus(PrescriptionStatus.SIGNED.name());
    }

    @Test
    void sendHospitalCreatesRequestForSignedPrescription() {
        doNothing().when(accessService).assertCanWritePharmacyRequests(principal);
        when(patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId))
                .thenReturn(Optional.of(profile));
        when(prescriptionRepository.findByIdAndTenantIdAndDeletedAtIsNull(prescriptionId, tenantId))
                .thenReturn(Optional.of(prescription));
        when(requestRepository.findByPrescriptionIdAndDeletedAtIsNullAndStatusNot(
                prescriptionId, PharmacyRequestStatus.CANCELLED.name()))
                .thenReturn(Optional.empty());

        PrescriptionItemEntity item = new PrescriptionItemEntity();
        item.setId(UUID.fromString("00000000-0000-0000-0000-000000000082"));
        item.setMedicineName("Paracetamol");
        item.setQuantity(10);
        when(prescriptionItemRepository.findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(prescriptionId))
                .thenReturn(List.of(item));
        when(requestRepository.countByTenantIdAndRequestedAtGreaterThanEqualAndDeletedAtIsNull(any(), any()))
                .thenReturn(0L);
        when(requestRepository.save(any(PharmacyRequestEntity.class))).thenAnswer(inv -> {
            PharmacyRequestEntity saved = inv.getArgument(0);
            saved.setId(UUID.fromString("00000000-0000-0000-0000-000000000083"));
            return saved;
        });
        when(requestItemRepository.save(any(PharmacyRequestItemEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(requestItemRepository.findByPharmacyRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(any()))
                .thenReturn(List.of());

        PharmacyRequestResponse response = pharmacyRequestService.sendHospital(principal, prescriptionId);

        assertEquals(PharmacyRequestStatus.REQUESTED.name(), response.getStatus());
        assertEquals(prescriptionId, response.getPrescriptionId());
        ArgumentCaptor<PharmacyRequestEntity> captor = ArgumentCaptor.forClass(PharmacyRequestEntity.class);
        verify(requestRepository).save(captor.capture());
        assertEquals(PharmacyRequestStatus.REQUESTED.name(), captor.getValue().getStatus());
    }

    @Test
    void sendHospitalRejectsDraftPrescription() {
        doNothing().when(accessService).assertCanWritePharmacyRequests(principal);
        when(patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId))
                .thenReturn(Optional.of(profile));
        prescription.setStatus(PrescriptionStatus.DRAFT.name());
        when(prescriptionRepository.findByIdAndTenantIdAndDeletedAtIsNull(prescriptionId, tenantId))
                .thenReturn(Optional.of(prescription));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> pharmacyRequestService.sendHospital(principal, prescriptionId));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getCode());
    }

    @Test
    void receiveTransitionsRequestedToReceived() {
        UUID requestId = UUID.fromString("00000000-0000-0000-0000-000000000083");
        PharmacyRequestEntity request = baseRequest(requestId, PharmacyRequestStatus.REQUESTED.name());

        doNothing().when(accessService).assertCanFulfillPharmacyRequests(principal);
        doNothing().when(accessService).assertHospitalScope(principal, request.getHospitalId());
        when(requestRepository.findByIdAndTenantIdAndDeletedAtIsNull(requestId, tenantId))
                .thenReturn(Optional.of(request));
        when(requestRepository.save(any(PharmacyRequestEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(prescriptionRepository.findByIdAndTenantIdAndDeletedAtIsNull(prescriptionId, tenantId))
                .thenReturn(Optional.of(prescription));
        when(patientProfileRepository.findByIdAndTenantIdAndDeletedAtIsNull(patientId, tenantId))
                .thenReturn(Optional.of(profile));
        when(requestItemRepository.findByPharmacyRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(requestId))
                .thenReturn(List.of());

        PharmacyRequestResponse response = pharmacyRequestService.receive(principal, requestId);

        assertEquals(PharmacyRequestStatus.RECEIVED.name(), response.getStatus());
        assertEquals(PharmacyRequestStatus.RECEIVED.name(), request.getStatus());
    }

    @Test
    void markReadyNotifiesPatient() {
        UUID requestId = UUID.fromString("00000000-0000-0000-0000-000000000083");
        PharmacyRequestEntity request = baseRequest(requestId, PharmacyRequestStatus.UNDER_REVIEW.name());

        doNothing().when(accessService).assertCanFulfillPharmacyRequests(principal);
        doNothing().when(accessService).assertHospitalScope(principal, request.getHospitalId());
        when(requestRepository.findByIdAndTenantIdAndDeletedAtIsNull(requestId, tenantId))
                .thenReturn(Optional.of(request));
        when(requestRepository.save(any(PharmacyRequestEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(prescriptionRepository.findByIdAndTenantIdAndDeletedAtIsNull(prescriptionId, tenantId))
                .thenReturn(Optional.of(prescription));
        when(patientProfileRepository.findByIdAndTenantIdAndDeletedAtIsNull(patientId, tenantId))
                .thenReturn(Optional.of(profile));
        when(requestItemRepository.findByPharmacyRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(requestId))
                .thenReturn(List.of());

        PharmacyRequestResponse response = pharmacyRequestService.markReady(principal, requestId, null);

        assertEquals(PharmacyRequestStatus.READY.name(), response.getStatus());
        verify(notificationService).send(
                any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void receiveRejectsInvalidStatus() {
        UUID requestId = UUID.fromString("00000000-0000-0000-0000-000000000083");
        PharmacyRequestEntity request = baseRequest(requestId, PharmacyRequestStatus.READY.name());

        doNothing().when(accessService).assertCanFulfillPharmacyRequests(principal);
        doNothing().when(accessService).assertHospitalScope(principal, request.getHospitalId());
        when(requestRepository.findByIdAndTenantIdAndDeletedAtIsNull(requestId, tenantId))
                .thenReturn(Optional.of(request));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> pharmacyRequestService.receive(principal, requestId));
        assertEquals(ErrorCode.INVALID_STATUS_TRANSITION, ex.getCode());
    }

    private PharmacyRequestEntity baseRequest(UUID requestId, String status) {
        PharmacyRequestEntity request = new PharmacyRequestEntity();
        request.setId(requestId);
        request.setTenantId(tenantId);
        request.setPrescriptionId(prescriptionId);
        request.setEncounterId(prescription.getEncounterId());
        request.setPatientId(patientId);
        request.setHospitalId(prescription.getHospitalId());
        request.setBranchId(prescription.getBranchId());
        request.setRequestNumber("PHR-2026-00001");
        request.setStatus(status);
        request.setRequestedAt(java.time.Instant.parse("2026-01-01T00:00:00Z"));
        return request;
    }
}
