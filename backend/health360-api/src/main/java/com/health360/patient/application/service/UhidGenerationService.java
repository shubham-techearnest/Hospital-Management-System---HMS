package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.UhidSequenceEntity;
import com.health360.patient.infrastructure.persistence.repository.UhidSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UhidGenerationService {

    private final UhidSequenceRepository sequenceRepository;

    @Transactional
    public String allocateUhid(UUID tenantId) {
        int year = java.time.LocalDate.now(ZoneId.systemDefault()).getYear();
        UhidSequenceEntity sequence = resolveSequence(tenantId, year);

        long next = sequence.getLastValue() + 1;
        sequence.setLastValue(next);
        sequence.setUpdatedAt(Instant.now());
        sequenceRepository.save(sequence);

        return "H360-" + year + "-" + String.format("%08d", next);
    }

    private UhidSequenceEntity resolveSequence(UUID tenantId, int year) {
        return sequenceRepository.findForUpdate(tenantId, year)
                .orElseGet(() -> {
                    try {
                        return createSequence(tenantId, year);
                    } catch (DataIntegrityViolationException ex) {
                        return sequenceRepository.findForUpdate(tenantId, year)
                                .orElseThrow(() -> ex);
                    }
                });
    }

    private UhidSequenceEntity createSequence(UUID tenantId, int year) {
        UhidSequenceEntity sequence = new UhidSequenceEntity();
        sequence.setTenantId(tenantId);
        sequence.setSequenceYear(year);
        sequence.setLastValue(0);
        return sequenceRepository.save(sequence);
    }
}
