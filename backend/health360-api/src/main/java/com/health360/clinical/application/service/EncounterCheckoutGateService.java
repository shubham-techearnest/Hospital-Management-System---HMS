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
    private static final String IPD = "IPD";
    private static final String ICU = "ICU";

    private final ClinicalNoteRepository noteRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final EncounterRepository encounterRepository;
    private final IpdDischargeSummaryRepository dischargeSummaryRepository;
    private final IcuStayRepository icuStayRepository;

    @Transactional(readOnly = true)
    public void assertReadyForCheckout(UUID encounterId) {
        EncounterEntity encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));

        if (IPD.equalsIgnoreCase(encounter.getEncounterType())) {
            if (dischargeSummaryRepository.existsByEncounterIdAndDeletedAtIsNull(encounterId)) {
                return;
            }
            throw new BusinessException(
                    ErrorCode.CHECKOUT_NOT_READY,
                    HttpStatus.CONFLICT,
                    "IPD checkout is blocked until the patient has a discharge summary.");
        }

        if (ICU.equalsIgnoreCase(encounter.getEncounterType())) {
            if (icuStayRepository.existsByEncounterIdAndDeletedAtIsNull(encounterId)) {
                return;
            }
            throw new BusinessException(
                    ErrorCode.CHECKOUT_NOT_READY,
                    HttpStatus.CONFLICT,
                    "ICU checkout is blocked until an ICU stay exists for this encounter.");
        }

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
