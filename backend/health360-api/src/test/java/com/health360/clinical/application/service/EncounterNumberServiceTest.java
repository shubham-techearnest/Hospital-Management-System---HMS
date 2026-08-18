package com.health360.clinical.application.service;

import com.health360.clinical.domain.EncounterType;
import com.health360.clinical.infrastructure.persistence.entity.EncounterNumberSequenceEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterNumberSequenceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EncounterNumberServiceTest {

    private static final UUID TENANT_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");

    @Mock
    private EncounterNumberSequenceRepository sequenceRepository;

    @InjectMocks
    private EncounterNumberService encounterNumberService;

    @Test
    void allocatesOpdFormattedNumber() {
        EncounterNumberSequenceEntity sequence = new EncounterNumberSequenceEntity();
        sequence.setLastValue(4520);
        when(sequenceRepository.findForUpdate(TENANT_ID, HOSPITAL_ID, java.time.LocalDate.now().getYear()))
                .thenReturn(Optional.of(sequence));

        String number = encounterNumberService.allocateEncounterNumber(TENANT_ID, HOSPITAL_ID, EncounterType.OPD);

        assertTrue(number.startsWith("OPD-"));
        assertTrue(number.endsWith("-004521"));
        assertEquals(4521L, sequence.getLastValue());
        verify(sequenceRepository).save(sequence);
    }

    @Test
    void createsSequenceWhenMissing() {
        when(sequenceRepository.findForUpdate(TENANT_ID, HOSPITAL_ID, java.time.LocalDate.now().getYear()))
                .thenReturn(Optional.empty());

        when(sequenceRepository.save(any(EncounterNumberSequenceEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        String number = encounterNumberService.allocateEncounterNumber(TENANT_ID, HOSPITAL_ID, EncounterType.OPD);

        assertTrue(number.matches("OPD-\\d{4}-000001"));
        verify(sequenceRepository).findForUpdate(TENANT_ID, HOSPITAL_ID, java.time.LocalDate.now().getYear());
        verify(sequenceRepository, times(2)).save(any(EncounterNumberSequenceEntity.class));
    }
}
