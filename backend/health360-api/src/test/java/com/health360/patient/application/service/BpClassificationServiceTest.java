package com.health360.patient.application.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BpClassificationServiceTest {

    private final BpClassificationService service = new BpClassificationService();

    @Test
    void normalBp() {
        var result = service.classify(118, 76);
        assertThat(result.category()).isEqualTo("NORMAL");
    }

    @Test
    void elevatedBp() {
        var result = service.classify(125, 78);
        assertThat(result.category()).isEqualTo("WARNING");
    }

    @Test
    void criticalBp() {
        var result = service.classify(145, 92);
        assertThat(result.category()).isEqualTo("CRITICAL");
    }
}
