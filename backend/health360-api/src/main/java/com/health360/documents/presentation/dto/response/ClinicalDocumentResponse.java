package com.health360.documents.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
@Builder
public class ClinicalDocumentResponse {
    String documentType;
    String documentTitle;
    String documentNumber;
    String issuedAt;
    LetterheadSnapshot letterhead;
    PatientBlock patient;
    ClinicianBlock clinician;
    List<MedicationLine> medications;
    ConsultationSections consultation;
    LabSections lab;
    PharmacyBillSections pharmacy;
    String notes;

    @Value
    @Builder
    public static class PatientBlock {
        UUID patientId;
        String patientName;
        String uhid;
        String ageSex;
        String encounterNumber;
        String visitDate;
    }

    @Value
    @Builder
    public static class ClinicianBlock {
        String name;
        String roleLabel;
        String registrationNumber;
        String specialization;
        String signedAt;
    }

    @Value
    @Builder
    public static class MedicationLine {
        int sequence;
        String medicineName;
        String doseText;
        String route;
        String frequency;
        String durationText;
        String quantity;
        String instructions;
        String howToTake;
    }

    @Value
    @Builder
    public static class ConsultationSections {
        String chiefComplaint;
        String hpi;
        String examination;
        String assessment;
        String plan;
        String content;
    }

    @Value
    @Builder
    public static class LabSections {
        String orderNumber;
        String orderedAt;
        String sampleCollectedAt;
        String reportedAt;
        String summaryText;
        boolean critical;
        List<LabResultLine> results;
    }

    @Value
    @Builder
    public static class LabResultLine {
        String testName;
        String valueText;
        String unit;
        String referenceRange;
        String flag;
    }

    @Value
    @Builder
    public static class PharmacyBillSections {
        String requestNumber;
        String dispensedAt;
        List<PharmacyLine> lines;
        String totalAmountText;
    }

    @Value
    @Builder
    public static class PharmacyLine {
        String medicineName;
        String quantity;
        String howToTake;
        String amountText;
    }
}
