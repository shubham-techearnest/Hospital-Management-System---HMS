package com.health360.doctor.application.service;

import com.health360.doctor.infrastructure.persistence.entity.*;
import com.health360.doctor.presentation.dto.response.*;
import com.health360.shared.infrastructure.persistence.entity.SpecializationEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class DoctorProfileMapper {

    public DoctorProfileResponse toResponse(
            DoctorProfileEntity profile,
            List<QualificationEntity> qualifications,
            List<ExperienceEntryEntity> experience,
            List<ConsultationDefaultEntity> consultationDefaults,
            Map<UUID, SpecializationEntity> specializationById,
            List<String> languages,
            List<VerificationDocumentEntity> verificationDocuments) {

        SpecializationEntity primary = profile.getPrimarySpecializationId() != null
                ? specializationById.get(profile.getPrimarySpecializationId())
                : null;

        return DoctorProfileResponse.builder()
                .id(profile.getId())
                .verificationStatus(profile.getVerificationStatus())
                .verificationRejectionReason(profile.getVerificationRejectionReason())
                .submittedAt(profile.getSubmittedAt())
                .professionalDetails(DoctorProfileResponse.ProfessionalDetails.builder()
                        .title(profile.getTitle())
                        .medicalRegistrationNumber(profile.getMedicalRegistrationNumber())
                        .registrationCouncil(profile.getRegistrationCouncil())
                        .registrationYear(profile.getRegistrationYear())
                        .registrationExpiry(profile.getRegistrationExpiry())
                        .gender(profile.getGender())
                        .biography(profile.getBiography())
                        .profilePhotoUrl(profile.getProfilePhotoUrl())
                        .totalYearsExperience(profile.getTotalYearsExperience())
                        .build())
                .specialization(DoctorProfileResponse.SpecializationInfo.builder()
                        .primarySpecializationId(profile.getPrimarySpecializationId())
                        .primarySpecializationName(primary != null ? primary.getName() : null)
                        .subSpecializations(List.of())
                        .build())
                .qualifications(qualifications.stream().map(this::toQualificationResponse).toList())
                .experience(experience.stream().map(this::toExperienceResponse).toList())
                .consultationDefaults(consultationDefaults.stream().map(this::toConsultationResponse).toList())
                .languages(languages)
                .verificationDocuments(verificationDocuments.stream().map(this::toVerificationDocumentResponse).toList())
                .build();
    }

    public DoctorProfileResponse withSubSpecializations(
            DoctorProfileResponse response,
            List<SpecializationEntity> subSpecializations) {
        return DoctorProfileResponse.builder()
                .id(response.getId())
                .verificationStatus(response.getVerificationStatus())
                .verificationRejectionReason(response.getVerificationRejectionReason())
                .submittedAt(response.getSubmittedAt())
                .professionalDetails(response.getProfessionalDetails())
                .specialization(DoctorProfileResponse.SpecializationInfo.builder()
                        .primarySpecializationId(response.getSpecialization().getPrimarySpecializationId())
                        .primarySpecializationName(response.getSpecialization().getPrimarySpecializationName())
                        .subSpecializations(subSpecializations.stream().map(this::toSpecializationResponse).toList())
                        .build())
                .qualifications(response.getQualifications())
                .experience(response.getExperience())
                .consultationDefaults(response.getConsultationDefaults())
                .languages(response.getLanguages())
                .verificationDocuments(response.getVerificationDocuments())
                .build();
    }

    public VerificationDocumentResponse toVerificationDocumentResponse(VerificationDocumentEntity entity) {
        return VerificationDocumentResponse.builder()
                .id(entity.getId())
                .documentType(entity.getDocumentType())
                .fileName(entity.getFileName())
                .contentType(entity.getContentType())
                .fileSizeBytes(entity.getFileSizeBytes())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }

    public QualificationResponse toQualificationResponse(QualificationEntity entity) {
        return QualificationResponse.builder()
                .id(entity.getId())
                .degree(entity.getDegree())
                .institution(entity.getInstitution())
                .yearOfCompletion(entity.getYearOfCompletion())
                .country(entity.getCountry())
                .build();
    }

    public AwardResponse toAwardResponse(AwardEntity entity) {
        return AwardResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .organization(entity.getOrganization())
                .awardYear(entity.getAwardYear())
                .build();
    }

    public MembershipResponse toMembershipResponse(MembershipEntity entity) {
        return MembershipResponse.builder()
                .id(entity.getId())
                .organization(entity.getOrganization())
                .membershipId(entity.getMembershipId())
                .memberSince(entity.getMemberSince())
                .build();
    }

    public ExperienceResponse toExperienceResponse(ExperienceEntryEntity entity) {
        return ExperienceResponse.builder()
                .id(entity.getId())
                .institution(entity.getInstitution())
                .position(entity.getPosition())
                .startYear(entity.getStartYear())
                .endYear(entity.getEndYear())
                .build();
    }

    public ConsultationDefaultResponse toConsultationResponse(ConsultationDefaultEntity entity) {
        BigDecimal fee = entity.getFeeAmount();
        String feeDisplay = fee.compareTo(BigDecimal.ZERO) == 0
                ? "Free Consultation"
                : fee.stripTrailingZeros().toPlainString() + " " + entity.getCurrency();
        return ConsultationDefaultResponse.builder()
                .id(entity.getId())
                .consultationType(entity.getConsultationType())
                .feeAmount(fee)
                .currency(entity.getCurrency())
                .durationMinutes(entity.getDurationMinutes())
                .feeDisplay(feeDisplay)
                .build();
    }

    public SpecializationResponse toSpecializationResponse(SpecializationEntity entity) {
        return SpecializationResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .build();
    }
}
