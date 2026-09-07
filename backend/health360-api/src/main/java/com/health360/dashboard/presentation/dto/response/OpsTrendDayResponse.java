package com.health360.dashboard.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class OpsTrendDayResponse {
    LocalDate date;
    long opdWaiting;
    long opdCompleted;
    long opdInProgress;
}
