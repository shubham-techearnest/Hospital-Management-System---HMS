package com.health360.clinical.application.service;

import com.health360.clinical.domain.EncounterType;
import com.health360.clinical.infrastructure.persistence.entity.EncounterNumberSequenceEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterNumberSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EncounterNumberService {

    private final EncounterNumberSequenceRepository sequenceRepository;

    @Transactional
    public String allocateEncounterNumber(UUID tenantId, UUID hospitalId, EncounterType encounterType) {
        int year = java.time.LocalDate.now(ZoneId.systemDefault()).getYear();
        EncounterNumberSequenceEntity sequence = resolveSequence(tenantId, hospitalId, year);

        long next = sequence.getLastValue() + 1;
        sequence.setLastValue(next);
        sequence.setUpdatedAt(Instant.now());
        sequenceRepository.save(sequence);

        String prefix = switch (encounterType) {
            case OPD -> "OPD";
            case IPD -> "IPD";
            case ICU -> "ICU";
            default -> "ENC";
        };
        return prefix + "-" + year + "-" + String.format("%06d", next);
    }

    private EncounterNumberSequenceEntity resolveSequence(UUID tenantId, UUID hospitalId, int year) {
        return sequenceRepository.findForUpdate(tenantId, hospitalId, year)
                .orElseGet(() -> {
                    try {
                        return createSequence(tenantId, hospitalId, year);
                    } catch (DataIntegrityViolationException ex) {
                        return sequenceRepository.findForUpdate(tenantId, hospitalId, year)
                                .orElseThrow(() -> ex);
                    }
                });
    }

    private EncounterNumberSequenceEntity createSequence(UUID tenantId, UUID hospitalId, int year) {
        EncounterNumberSequenceEntity sequence = new EncounterNumberSequenceEntity();
        sequence.setTenantId(tenantId);
        sequence.setHospitalId(hospitalId);
        sequence.setSequenceYear(year);
        sequence.setLastValue(0);
        return sequenceRepository.save(sequence);
    }
}
