package com.health360.clinical.application.service;

import com.health360.clinical.domain.ClinicalNoteType;
import com.health360.clinical.domain.PrescriptionStatus;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalNoteRepository;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EncounterCheckoutGateService {

    private static final String FINAL_NOTE = "FINAL";

    private final ClinicalNoteRepository noteRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional(readOnly = true)
    public void assertReadyForCheckout(UUID encounterId) {
        boolean consultFinal = noteRepository.existsByEncounterIdAndNoteTypeAndStatusAndDeletedAtIsNull(
                encounterId, ClinicalNoteType.CONSULTATION.name(), FINAL_NOTE);
        boolean rxSigned = prescriptionRepository.existsByEncounterIdAndStatusAndDeletedAtIsNull(
                encounterId, PrescriptionStatus.SIGNED.name());

        if (consultFinal && rxSigned) {
            return;
        }

        List<String> missing = new ArrayList<>();
        if (!consultFinal) {
            missing.add("finalized consultation report");
        }
        if (!rxSigned) {
            missing.add("signed e-prescription");
        }
        throw new BusinessException(
                ErrorCode.CHECKOUT_NOT_READY,
                HttpStatus.CONFLICT,
                "Checkout is blocked until the doctor has a " + String.join(" and a ", missing) + ".");
    }
}
