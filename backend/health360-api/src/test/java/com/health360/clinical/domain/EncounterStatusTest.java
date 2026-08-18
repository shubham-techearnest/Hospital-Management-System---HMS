package com.health360.clinical.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EncounterStatusTest {

    @Test
    void registeredCanMoveToWaitingOrInProgressOrCancelled() {
        assertThat(EncounterStatus.REGISTERED.canTransitionTo(EncounterStatus.WAITING)).isTrue();
        assertThat(EncounterStatus.REGISTERED.canTransitionTo(EncounterStatus.IN_PROGRESS)).isTrue();
        assertThat(EncounterStatus.REGISTERED.canTransitionTo(EncounterStatus.CANCELLED)).isTrue();
        assertThat(EncounterStatus.REGISTERED.canTransitionTo(EncounterStatus.COMPLETED)).isFalse();
    }

    @Test
    void inProgressCanCompleteOrCancel() {
        assertThat(EncounterStatus.IN_PROGRESS.canTransitionTo(EncounterStatus.COMPLETED)).isTrue();
        assertThat(EncounterStatus.IN_PROGRESS.canTransitionTo(EncounterStatus.CANCELLED)).isTrue();
        assertThat(EncounterStatus.IN_PROGRESS.canTransitionTo(EncounterStatus.WAITING)).isFalse();
    }

    @Test
    void completedIsTerminal() {
        assertThat(EncounterStatus.COMPLETED.canTransitionTo(EncounterStatus.IN_PROGRESS)).isFalse();
    }
}
