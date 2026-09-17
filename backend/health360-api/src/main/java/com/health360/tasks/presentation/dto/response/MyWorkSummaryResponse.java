package com.health360.tasks.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MyWorkSummaryResponse {
    long urgent;
    long today;
    long overdue;
    long pending;
    long openTotal;
}
