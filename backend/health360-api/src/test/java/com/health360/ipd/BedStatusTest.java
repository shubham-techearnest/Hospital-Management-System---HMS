package com.health360.ipd;

import com.health360.ipd.domain.BedStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BedStatusTest {

    @Test
    void cleaningTurnaroundAndReservePaths() {
        assertTrue(BedStatus.OCCUPIED.canTransitionTo(BedStatus.CLEANING));
        assertTrue(BedStatus.CLEANING.canTransitionTo(BedStatus.AVAILABLE));
        assertTrue(BedStatus.AVAILABLE.canTransitionTo(BedStatus.RESERVED));
        assertTrue(BedStatus.RESERVED.canTransitionTo(BedStatus.OCCUPIED));
        assertFalse(BedStatus.OCCUPIED.canTransitionTo(BedStatus.RESERVED));
        assertFalse(BedStatus.BLOCKED.canTransitionTo(BedStatus.OCCUPIED));
    }
}
