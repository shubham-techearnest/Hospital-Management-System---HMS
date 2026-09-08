package com.health360.ipd;

import com.health360.ipd.domain.AdmissionRequestStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdmissionRequestStatusTest {

    @Test
    void allowsRequestToApprovedAndRejectsTerminal() {
        assertTrue(AdmissionRequestStatus.REQUESTED.canTransitionTo(AdmissionRequestStatus.APPROVED));
        assertTrue(AdmissionRequestStatus.APPROVED.canTransitionTo(AdmissionRequestStatus.ADMITTED));
        assertTrue(AdmissionRequestStatus.SCHEDULED.canTransitionTo(AdmissionRequestStatus.ADMITTED));
        assertFalse(AdmissionRequestStatus.ADMITTED.canTransitionTo(AdmissionRequestStatus.APPROVED));
        assertFalse(AdmissionRequestStatus.REJECTED.canTransitionTo(AdmissionRequestStatus.APPROVED));
    }
}
