package com.health360.scheduling.domain;

import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AppointmentFilterTest {

    @Test
    void parseAcceptsValidFilters() {
        assertThat(AppointmentFilter.parse("upcoming")).isEqualTo(AppointmentFilter.UPCOMING);
        assertThat(AppointmentFilter.parse("past")).isEqualTo(AppointmentFilter.PAST);
        assertThat(AppointmentFilter.parse("cancelled")).isEqualTo(AppointmentFilter.CANCELLED);
        assertThat(AppointmentFilter.parse(null)).isEqualTo(AppointmentFilter.ALL);
    }

    @Test
    void parseRejectsInvalidFilter() {
        assertThatThrownBy(() -> AppointmentFilter.parse("invalid"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(be.getCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                });
    }
}
