package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class DoctorProfileResponse {
    UUID id;
    String verificationStatus;
    String verificationRejectionReason;
    Instant submittedAt;
    ProfessionalDetails professionalDetails;
    SpecializationInfo specialization;
    List<QualificationResponse> qualifications;
    List<ExperienceResponse> experience;
    List<ConsultationDefaultResponse> consultationDefaults;
    List<String> languages;
    List<VerificationDocumentResponse> verificationDocuments;

    @Value
    @Builder
    public static class ProfessionalDetails {
        String title;
        String medicalRegistrationNumber;
        String registrationCouncil;
        Integer registrationYear;
        LocalDate registrationExpiry;
        String gender;
        String biography;
        String profilePhotoUrl;
        Integer totalYearsExperience;
    }

    @Value
    @Builder
    public static class SpecializationInfo {
        UUID primarySpecializationId;
        String primarySpecializationName;
        List<SpecializationResponse> subSpecializations;
    }
}
