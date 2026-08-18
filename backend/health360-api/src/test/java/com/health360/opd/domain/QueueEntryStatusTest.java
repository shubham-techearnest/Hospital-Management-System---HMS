package com.health360.opd.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QueueEntryStatusTest {

    @Test
    void waitingCanTransitionToCalledOrCancelled() {
        assertTrue(QueueEntryStatus.WAITING.canTransitionTo(QueueEntryStatus.CALLED));
        assertTrue(QueueEntryStatus.WAITING.canTransitionTo(QueueEntryStatus.CANCELLED));
        assertTrue(QueueEntryStatus.WAITING.canTransitionTo(QueueEntryStatus.NO_SHOW));
        assertFalse(QueueEntryStatus.WAITING.canTransitionTo(QueueEntryStatus.COMPLETED));
    }

    @Test
    void calledCanTransitionToInService() {
        assertTrue(QueueEntryStatus.CALLED.canTransitionTo(QueueEntryStatus.IN_SERVICE));
        assertFalse(QueueEntryStatus.CALLED.canTransitionTo(QueueEntryStatus.COMPLETED));
    }

    @Test
    void inServiceCanComplete() {
        assertTrue(QueueEntryStatus.IN_SERVICE.canTransitionTo(QueueEntryStatus.COMPLETED));
        assertFalse(QueueEntryStatus.IN_SERVICE.canTransitionTo(QueueEntryStatus.WAITING));
    }

    @Test
    void terminalStatesHaveNoTransitions() {
        assertFalse(QueueEntryStatus.COMPLETED.canTransitionTo(QueueEntryStatus.WAITING));
        assertFalse(QueueEntryStatus.CANCELLED.canTransitionTo(QueueEntryStatus.CALLED));
    }
}
