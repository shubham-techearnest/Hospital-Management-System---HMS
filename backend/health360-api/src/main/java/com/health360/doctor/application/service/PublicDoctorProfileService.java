package com.health360.doctor.application.service;

import com.health360.config.Health360Properties;
import com.health360.doctor.infrastructure.persistence.entity.*;
import com.health360.doctor.infrastructure.persistence.repository.*;
import com.health360.doctor.presentation.dto.response.ConsultationDefaultResponse;
import com.health360.doctor.presentation.dto.response.PublicDoctorProfileResponse;
import com.health360.doctor.presentation.dto.response.QualificationResponse;
import com.health360.doctor.presentation.dto.response.AwardResponse;
import com.health360.doctor.presentation.dto.response.MembershipResponse;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.scheduling.infrastructure.persistence.repository.TimeSlotRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.shared.infrastructure.persistence.entity.SpecializationEntity;
import com.health360.shared.infrastructure.persistence.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PublicDoctorProfileService {

    private static final String VERIFIED = "VERIFIED";

    private final Health360Properties health360Properties;
    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
    private final QualificationRepository qualificationRepository;
    private final AwardRepository awardRepository;
    private final MembershipRepository membershipRepository;
    private final DoctorLanguageRepository doctorLanguageRepository;
    private final ConsultationDefaultRepository consultationDefaultRepository;
    private final HospitalAssociationRepository hospitalAssociationRepository;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final DoctorProfileMapper doctorProfileMapper;

    @Transactional(readOnly = true)
    public PublicDoctorProfileResponse getPublicProfile(UUID doctorId) {
        UUID tenantId = health360Properties.getDefaultTenantId();
        DoctorProfileEntity profile = doctorProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(doctorId, tenantId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Doctor not found"));

        if (!VERIFIED.equals(profile.getVerificationStatus())) {
            throw new BusinessException(
                    ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Doctor not found");
        }

        UserEntity user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Doctor not found"));

        String specializationName = null;
        if (profile.getPrimarySpecializationId() != null) {
            specializationName = specializationRepository.findById(profile.getPrimarySpecializationId())
                    .map(SpecializationEntity::getName)
                    .orElse(null);
        }

        List<QualificationEntity> qualifications = qualificationRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByYearOfCompletionDesc(profile.getId());
        List<AwardEntity> awards = awardRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByAwardYearDescTitleAsc(profile.getId());
        List<MembershipEntity> memberships = membershipRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByOrganizationAsc(profile.getId());
        List<String> languages = doctorLanguageRepository.findByDoctorIdOrderByLanguageCodeAsc(profile.getId())
                .stream()
                .map(DoctorLanguageEntity::getLanguageCode)
                .toList();
        List<ConsultationDefaultEntity> fees = consultationDefaultRepository
                .findByDoctorIdAndDeletedAtIsNull(profile.getId());

        List<PublicDoctorProfileResponse.HospitalPracticeResponse> hospitals = buildHospitalPractices(profile, fees);

        LocalDate today = LocalDate.now();
        long availableToday = timeSlotRepository.countByDoctorIdAndSlotDateAndStatusAndDeletedAtIsNull(
                profile.getId(), today, "AVAILABLE");
        long availableNext7Days = timeSlotRepository.countByDoctorIdAndSlotDateBetweenAndStatusAndDeletedAtIsNull(
                profile.getId(), today, today.plusDays(7), "AVAILABLE");

        BigDecimal rating = profile.getAverageRating() != null
                ? profile.getAverageRating().setScale(1, RoundingMode.HALF_UP)
                : null;

        String displayName = (user.getFirstName() + " " + user.getLastName()).trim();

        return PublicDoctorProfileResponse.builder()
                .id(profile.getId())
                .name(displayName)
                .title(profile.getTitle())
                .verified(true)
                .specialization(specializationName)
                .averageRating(rating)
                .reviewCount(profile.getReviewCount())
                .gender(profile.getGender())
                .biography(profile.getBiography())
                .profilePhotoUrl(profile.getProfilePhotoUrl())
                .yearsExperience(profile.getTotalYearsExperience())
                .languages(languages)
                .qualifications(qualifications.stream()
                        .map(doctorProfileMapper::toQualificationResponse)
                        .toList())
                .awards(awards.stream()
                        .map(doctorProfileMapper::toAwardResponse)
                        .toList())
                .memberships(memberships.stream()
                        .map(doctorProfileMapper::toMembershipResponse)
                        .toList())
                .hospitals(hospitals)
                .availabilityPreview(PublicDoctorProfileResponse.AvailabilityPreview.builder()
                        .availableToday(availableToday > 0)
                        .availableSlotsNext7Days((int) availableNext7Days)
                        .build())
                .build();
    }

    private List<PublicDoctorProfileResponse.HospitalPracticeResponse> buildHospitalPractices(
            DoctorProfileEntity profile,
            List<ConsultationDefaultEntity> fees) {
        List<HospitalAssociationEntity> associations = hospitalAssociationRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(profile.getId())
                .stream()
                .filter(a -> "ACTIVE".equals(a.getStatus()))
                .toList();

        if (associations.isEmpty()) {
            return List.of();
        }

        Set<UUID> hospitalIds = new HashSet<>();
        Set<UUID> branchIds = new HashSet<>();
        associations.forEach(a -> {
            hospitalIds.add(a.getHospitalId());
            if (a.getBranchId() != null) {
                branchIds.add(a.getBranchId());
            }
        });

        Map<UUID, HospitalEntity> hospitals = hospitalRepository.findAllById(hospitalIds).stream()
                .filter(h -> h.getDeletedAt() == null)
                .collect(HashMap::new, (m, h) -> m.put(h.getId(), h), HashMap::putAll);
        Map<UUID, BranchEntity> branches = branchRepository.findAllById(branchIds).stream()
                .filter(b -> b.getDeletedAt() == null)
                .collect(HashMap::new, (m, b) -> m.put(b.getId(), b), HashMap::putAll);

        List<ConsultationDefaultResponse> feeResponses = fees.stream()
                .map(doctorProfileMapper::toConsultationResponse)
                .toList();

        List<PublicDoctorProfileResponse.HospitalPracticeResponse> result = new ArrayList<>();
        for (HospitalAssociationEntity association : associations) {
            HospitalEntity hospital = hospitals.get(association.getHospitalId());
            if (hospital == null) {
                continue;
            }
            BranchEntity branch = association.getBranchId() != null
                    ? branches.get(association.getBranchId())
                    : null;
            result.add(PublicDoctorProfileResponse.HospitalPracticeResponse.builder()
                    .hospitalId(hospital.getId())
                    .hospitalName(hospital.getName())
                    .branchId(branch != null ? branch.getId() : null)
                    .branchName(branch != null ? branch.getName() : null)
                    .city(branch != null ? branch.getCity() : null)
                    .consultationFees(feeResponses)
                    .build());
        }
        return result;
    }
}
