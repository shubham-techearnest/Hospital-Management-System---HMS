package com.health360.billing.application.service;

import com.health360.billing.infrastructure.persistence.entity.InvoiceNumberSequenceEntity;
import com.health360.billing.infrastructure.persistence.repository.InvoiceNumberSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceNumberService {

    private final InvoiceNumberSequenceRepository sequenceRepository;

    @Transactional
    public String allocateInvoiceNumber(UUID tenantId, UUID hospitalId) {
        int year = java.time.LocalDate.now(ZoneId.systemDefault()).getYear();
        InvoiceNumberSequenceEntity sequence = resolveSequence(tenantId, hospitalId, year);

        long next = sequence.getLastValue() + 1;
        sequence.setLastValue(next);
        sequence.setUpdatedAt(Instant.now());
        sequenceRepository.save(sequence);

        return "INV-" + year + "-" + String.format("%06d", next);
    }

    private InvoiceNumberSequenceEntity resolveSequence(UUID tenantId, UUID hospitalId, int year) {
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

    private InvoiceNumberSequenceEntity createSequence(UUID tenantId, UUID hospitalId, int year) {
        InvoiceNumberSequenceEntity sequence = new InvoiceNumberSequenceEntity();
        sequence.setTenantId(tenantId);
        sequence.setHospitalId(hospitalId);
        sequence.setSequenceYear(year);
        sequence.setLastValue(0);
        return sequenceRepository.save(sequence);
    }
}
