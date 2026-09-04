package com.health360.clinical.application.service;

import com.health360.clinical.domain.ClinicalNoteType;
import com.health360.clinical.domain.PrescriptionStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalNoteRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionRepository;
import com.health360.icu.infrastructure.persistence.repository.IcuStayRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdDischargeSummaryRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EncounterCheckoutGateServiceTest {

    @Mock
    private ClinicalNoteRepository noteRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private EncounterRepository encounterRepository;

    @Mock
    private IpdDischargeSummaryRepository dischargeSummaryRepository;

    @Mock
    private IcuStayRepository icuStayRepository;

    @InjectMocks
    private EncounterCheckoutGateService gateService;

    private final UUID encounterId = UUID.fromString("00000000-0000-0000-0000-000000000111");

    private EncounterEntity encounter(String type) {
        EncounterEntity entity = new EncounterEntity();
        entity.setId(encounterId);
        entity.setEncounterType(type);
        return entity;
    }

    @Test
    void allowsCheckoutWhenConsultFinalAndRxSigned() {
        when(encounterRepository.findById(encounterId)).thenReturn(Optional.of(encounter("OPD")));
        when(noteRepository.existsByEncounterIdAndNoteTypeAndStatusAndDeletedAtIsNull(
                encounterId, ClinicalNoteType.CONSULTATION.name(), "FINAL")).thenReturn(true);
        when(prescriptionRepository.existsByEncounterIdAndStatusAndDeletedAtIsNull(
                encounterId, PrescriptionStatus.SIGNED.name())).thenReturn(true);

        assertDoesNotThrow(() -> gateService.assertReadyForCheckout(encounterId));
    }

    @Test
    void blocksCheckoutWhenBothMissing() {
        when(encounterRepository.findById(encounterId)).thenReturn(Optional.of(encounter("OPD")));
        when(noteRepository.existsByEncounterIdAndNoteTypeAndStatusAndDeletedAtIsNull(
                encounterId, ClinicalNoteType.CONSULTATION.name(), "FINAL")).thenReturn(false);
        when(prescriptionRepository.existsByEncounterIdAndStatusAndDeletedAtIsNull(
                encounterId, PrescriptionStatus.SIGNED.name())).thenReturn(false);

        BusinessException ex = assertThrows(
                BusinessException.class, () -> gateService.assertReadyForCheckout(encounterId));
        assertEquals(ErrorCode.CHECKOUT_NOT_READY, ex.getCode());
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void blocksCheckoutWhenOnlyConsultMissing() {
        when(encounterRepository.findById(encounterId)).thenReturn(Optional.of(encounter("OPD")));
        when(noteRepository.existsByEncounterIdAndNoteTypeAndStatusAndDeletedAtIsNull(
                encounterId, ClinicalNoteType.CONSULTATION.name(), "FINAL")).thenReturn(false);
        when(prescriptionRepository.existsByEncounterIdAndStatusAndDeletedAtIsNull(
                encounterId, PrescriptionStatus.SIGNED.name())).thenReturn(true);

        BusinessException ex = assertThrows(
                BusinessException.class, () -> gateService.assertReadyForCheckout(encounterId));
        assertEquals(ErrorCode.CHECKOUT_NOT_READY, ex.getCode());
    }

    @Test
    void allowsIpdCheckoutWhenDischargeSummaryExists() {
        when(encounterRepository.findById(encounterId)).thenReturn(Optional.of(encounter("IPD")));
        when(dischargeSummaryRepository.existsByEncounterIdAndDeletedAtIsNull(encounterId)).thenReturn(true);

        assertDoesNotThrow(() -> gateService.assertReadyForCheckout(encounterId));
    }

    @Test
    void blocksIpdCheckoutWhenDischargeSummaryMissing() {
        when(encounterRepository.findById(encounterId)).thenReturn(Optional.of(encounter("IPD")));
        when(dischargeSummaryRepository.existsByEncounterIdAndDeletedAtIsNull(encounterId)).thenReturn(false);

        BusinessException ex = assertThrows(
                BusinessException.class, () -> gateService.assertReadyForCheckout(encounterId));
        assertEquals(ErrorCode.CHECKOUT_NOT_READY, ex.getCode());
    }

    @Test
    void allowsIcuCheckoutWhenStayExists() {
        when(encounterRepository.findById(encounterId)).thenReturn(Optional.of(encounter("ICU")));
        when(icuStayRepository.existsByEncounterIdAndDeletedAtIsNull(encounterId)).thenReturn(true);

        assertDoesNotThrow(() -> gateService.assertReadyForCheckout(encounterId));
    }

    @Test
    void blocksIcuCheckoutWhenStayMissing() {
        when(encounterRepository.findById(encounterId)).thenReturn(Optional.of(encounter("ICU")));
        when(icuStayRepository.existsByEncounterIdAndDeletedAtIsNull(encounterId)).thenReturn(false);

        BusinessException ex = assertThrows(
                BusinessException.class, () -> gateService.assertReadyForCheckout(encounterId));
        assertEquals(ErrorCode.CHECKOUT_NOT_READY, ex.getCode());
    }
}
