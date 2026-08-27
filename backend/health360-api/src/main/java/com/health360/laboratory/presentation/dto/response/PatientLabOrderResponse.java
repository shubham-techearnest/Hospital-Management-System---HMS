package com.health360.laboratory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class PatientLabOrderResponse {
    UUID clinicalOrderItemId;
    UUID clinicalOrderId;
    UUID encounterId;
    String encounterNumber;
    UUID hospitalId;
    String hospitalName;
    UUID branchId;
    UUID labTestId;
    String testName;
    String testCode;
    String itemStatus;
    UUID labOrderId;
    String labOrderStatus;
    Instant orderedAt;
    boolean canBookHospital;
    String specimenId;
    LabReportResponse report;
}
