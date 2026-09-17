package com.health360.emergency.presentation.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class EdVisitResponse {
    private UUID id;
    private UUID hospitalId;
    private UUID branchId;
    private UUID patientId;
    private String patientName;
    private UUID encounterId;
    private String encounterNumber;
    private String visitNumber;
    private String status;
    private String arrivalMode;
    private String chiefComplaint;
    private Integer triageAcuity;
    private String triageNotes;
    private Instant triagedAt;
    private String disposition;
    private Instant dispositionAt;
    private String dispositionNotes;
    private UUID resultingAdmissionId;
    private Instant arrivedAt;
}
