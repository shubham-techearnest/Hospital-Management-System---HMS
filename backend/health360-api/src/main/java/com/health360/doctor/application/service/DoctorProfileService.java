package com.health360.doctor.application.service;

import com.health360.doctor.infrastructure.persistence.entity.*;
import com.health360.doctor.infrastructure.persistence.repository.*;
import com.health360.doctor.presentation.dto.request.*;
import com.health360.doctor.presentation.dto.response.*;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.shared.infrastructure.persistence.entity.SpecializationEntity;
import com.health360.shared.infrastructure.persistence.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorProfileService {

    private static final Set<String> ALLOWED_CONSULTATION_TYPES = Set.of("IN_PERSON", "FOLLOW_UP");

    private final DoctorProfileRepository profileRepository;
    private final QualificationRepository qualificationRepository;
    private final ExperienceEntryRepository experienceRepository;
    private final AwardRepository awardRepository;
    private final MembershipRepository membershipRepository;
    private final ConsultationDefaultRepository consultationDefaultRepository;
    private final DoctorSubSpecializationRepository subSpecializationRepository;
    private final SpecializationRepository specializationRepository;
    private final DoctorLanguageRepository languageRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final DoctorProfileMapper mapper;
    private final AuditLogService auditLogService;
    private final DoctorProfileProvisioningService profileProvisioningService;

    @Transactional(readOnly = true)
    public DoctorProfileResponse getProfile(UUID userId, UUID tenantId) {
        DoctorProfileEntity profile = profileProvisioningService.ensureProfileEntity(userId, tenantId);
        return toFullResponse(profile);
    }

    public DoctorProfileEntity ensureProfileEntity(UUID userId, UUID tenantId) {
        return profileProvisioningService.ensureProfileEntity(userId, tenantId);
    }

    @Transactional(readOnly = true)
    public List<SpecializationResponse> listSpecializations() {
        return specializationRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(mapper::toSpecializationResponse)
                .toList();
    }

    @Transactional
    public DoctorProfileResponse updateProfessionalDetails(
            UUID userId, UUID tenantId, UpdateProfessionalDetailsRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);

        if (request.getMedicalRegistrationNumber() != null
                && !request.getMedicalRegistrationNumber().isBlank()
                && profileRepository.existsByTenantIdAndMedicalRegistrationNumberAndDeletedAtIsNullAndIdNot(
                        tenantId, request.getMedicalRegistrationNumber(), profile.getId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_REGISTRATION, HttpStatus.CONFLICT,
                    "Medical registration number already in use");
        }

        profile.setTitle(request.getTitle());
        profile.setMedicalRegistrationNumber(request.getMedicalRegistrationNumber());
        profile.setRegistrationCouncil(request.getRegistrationCouncil());
        profile.setRegistrationYear(request.getRegistrationYear());
        profile.setRegistrationExpiry(request.getRegistrationExpiry());
        profile.setGender(request.getGender());
        profile.setTotalYearsExperience(request.getTotalYearsExperience());
        profile.setUpdatedBy(userId);
        profile.touch();
        profileRepository.save(profile);

        auditLogService.record(tenantId, userId, "DOCTOR_PROFESSIONAL_DETAILS_UPDATED",
                "DoctorProfile", profile.getId(), Map.of());

        return toFullResponse(profile);
    }

    @Transactional
    public QualificationResponse createQualification(
            UUID userId, UUID tenantId, QualificationRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);

        QualificationEntity entity = new QualificationEntity();
        entity.setTenantId(tenantId);
        entity.setDoctorId(profile.getId());
        entity.setDegree(request.getDegree());
        entity.setInstitution(request.getInstitution());
        entity.setYearOfCompletion(request.getYearOfCompletion());
        entity.setCountry(request.getCountry() != null ? request.getCountry() : "IN");
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        entity = qualificationRepository.save(entity);

        auditLogService.record(tenantId, userId, "DOCTOR_QUALIFICATION_CREATED",
                "Qualification", entity.getId(), Map.of("doctorId", profile.getId()));

        return mapper.toQualificationResponse(entity);
    }

    @Transactional
    public QualificationResponse updateQualification(
            UUID userId, UUID tenantId, UUID qualificationId, QualificationRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        QualificationEntity entity = qualificationRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(qualificationId, profile.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Qualification not found"));

        entity.setDegree(request.getDegree());
        entity.setInstitution(request.getInstitution());
        entity.setYearOfCompletion(request.getYearOfCompletion());
        entity.setCountry(request.getCountry() != null ? request.getCountry() : "IN");
        entity.setUpdatedBy(userId);
        entity.touch();
        entity = qualificationRepository.save(entity);

        return mapper.toQualificationResponse(entity);
    }

    @Transactional
    public void deleteQualification(UUID userId, UUID tenantId, UUID qualificationId) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        QualificationEntity entity = qualificationRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(qualificationId, profile.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Qualification not found"));

        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        qualificationRepository.save(entity);
    }

    @Transactional
    public ExperienceResponse createExperience(
            UUID userId, UUID tenantId, ExperienceRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        validateExperienceYears(request.getStartYear(), request.getEndYear());

        ExperienceEntryEntity entity = new ExperienceEntryEntity();
        entity.setTenantId(tenantId);
        entity.setDoctorId(profile.getId());
        entity.setInstitution(request.getInstitution());
        entity.setPosition(request.getPosition());
        entity.setStartYear(request.getStartYear());
        entity.setEndYear(request.getEndYear());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        entity = experienceRepository.save(entity);

        return mapper.toExperienceResponse(entity);
    }

    @Transactional
    public ExperienceResponse updateExperience(
            UUID userId, UUID tenantId, UUID experienceId, ExperienceRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        validateExperienceYears(request.getStartYear(), request.getEndYear());

        ExperienceEntryEntity entity = experienceRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(experienceId, profile.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Experience entry not found"));

        entity.setInstitution(request.getInstitution());
        entity.setPosition(request.getPosition());
        entity.setStartYear(request.getStartYear());
        entity.setEndYear(request.getEndYear());
        entity.setUpdatedBy(userId);
        entity.touch();
        entity = experienceRepository.save(entity);

        return mapper.toExperienceResponse(entity);
    }

    @Transactional
    public DoctorProfileResponse updateBiography(
            UUID userId, UUID tenantId, UpdateBiographyRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        profile.setBiography(request.getBiography());
        profile.setUpdatedBy(userId);
        profile.touch();
        profileRepository.save(profile);

        auditLogService.record(tenantId, userId, "DOCTOR_BIOGRAPHY_UPDATED",
                "DoctorProfile", profile.getId(), Map.of());

        return toFullResponse(profile);
    }

    @Transactional
    public AwardResponse createAward(UUID userId, UUID tenantId, AwardRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);

        AwardEntity entity = new AwardEntity();
        entity.setTenantId(tenantId);
        entity.setDoctorId(profile.getId());
        entity.setTitle(request.getTitle());
        entity.setOrganization(request.getOrganization());
        entity.setAwardYear(request.getAwardYear());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        entity = awardRepository.save(entity);

        return mapper.toAwardResponse(entity);
    }

    @Transactional
    public AwardResponse updateAward(UUID userId, UUID tenantId, UUID awardId, AwardRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        AwardEntity entity = awardRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(awardId, profile.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Award not found"));

        entity.setTitle(request.getTitle());
        entity.setOrganization(request.getOrganization());
        entity.setAwardYear(request.getAwardYear());
        entity.setUpdatedBy(userId);
        entity.touch();
        entity = awardRepository.save(entity);

        return mapper.toAwardResponse(entity);
    }

    @Transactional
    public void deleteAward(UUID userId, UUID tenantId, UUID awardId) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        AwardEntity entity = awardRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(awardId, profile.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Award not found"));

        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        awardRepository.save(entity);
    }

    @Transactional
    public MembershipResponse createMembership(UUID userId, UUID tenantId, MembershipRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);

        MembershipEntity entity = new MembershipEntity();
        entity.setTenantId(tenantId);
        entity.setDoctorId(profile.getId());
        entity.setOrganization(request.getOrganization());
        entity.setMembershipId(request.getMembershipId());
        entity.setMemberSince(request.getMemberSince());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        entity = membershipRepository.save(entity);

        return mapper.toMembershipResponse(entity);
    }

    @Transactional
    public MembershipResponse updateMembership(
            UUID userId, UUID tenantId, UUID membershipId, MembershipRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        MembershipEntity entity = membershipRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(membershipId, profile.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Membership not found"));

        entity.setOrganization(request.getOrganization());
        entity.setMembershipId(request.getMembershipId());
        entity.setMemberSince(request.getMemberSince());
        entity.setUpdatedBy(userId);
        entity.touch();
        entity = membershipRepository.save(entity);

        return mapper.toMembershipResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<AwardResponse> listAwards(UUID userId, UUID tenantId) {
        DoctorProfileEntity profile = profileProvisioningService.ensureProfileEntity(userId, tenantId);
        return awardRepository.findByDoctorIdAndDeletedAtIsNullOrderByAwardYearDescTitleAsc(profile.getId())
                .stream()
                .map(mapper::toAwardResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MembershipResponse> listMemberships(UUID userId, UUID tenantId) {
        DoctorProfileEntity profile = profileProvisioningService.ensureProfileEntity(userId, tenantId);
        return membershipRepository.findByDoctorIdAndDeletedAtIsNullOrderByOrganizationAsc(profile.getId())
                .stream()
                .map(mapper::toMembershipResponse)
                .toList();
    }

    @Transactional
    public void deleteMembership(UUID userId, UUID tenantId, UUID membershipId) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        MembershipEntity entity = membershipRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(membershipId, profile.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Membership not found"));

        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        membershipRepository.save(entity);
    }

    @Transactional
    public void deleteExperience(UUID userId, UUID tenantId, UUID experienceId) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        ExperienceEntryEntity entity = experienceRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(experienceId, profile.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Experience entry not found"));

        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        experienceRepository.save(entity);
    }

    @Transactional
    public DoctorProfileResponse updateSpecialization(
            UUID userId, UUID tenantId, UpdateSpecializationRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);

        if (!specializationRepository.existsByIdAndActiveTrue(request.getPrimarySpecializationId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid primary specialization");
        }

        List<UUID> subIds = request.getSubSpecializationIds() != null
                ? request.getSubSpecializationIds()
                : List.of();

        for (UUID subId : subIds) {
            if (!specializationRepository.existsByIdAndActiveTrue(subId)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Invalid sub-specialization: " + subId);
            }
            if (subId.equals(request.getPrimarySpecializationId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Sub-specialization cannot match primary specialization");
            }
        }

        profile.setPrimarySpecializationId(request.getPrimarySpecializationId());
        profile.setUpdatedBy(userId);
        profile.touch();
        profileRepository.save(profile);

        subSpecializationRepository.deleteByDoctorId(profile.getId());
        for (UUID subId : subIds) {
            DoctorSubSpecializationEntity link = new DoctorSubSpecializationEntity();
            link.setDoctorId(profile.getId());
            link.setSpecializationId(subId);
            subSpecializationRepository.save(link);
        }

        return toFullResponse(profile);
    }

    @Transactional
    public DoctorProfileResponse updateConsultationDefaults(
            UUID userId, UUID tenantId, UpdateConsultationDefaultsRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);

        for (UpdateConsultationDefaultsRequest.ConsultationDefaultItem item : request.getConfigs()) {
            if (!ALLOWED_CONSULTATION_TYPES.contains(item.getConsultationType())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Invalid consultation type: " + item.getConsultationType());
            }

            ConsultationDefaultEntity entity = consultationDefaultRepository
                    .findByDoctorIdAndConsultationTypeAndDeletedAtIsNull(
                            profile.getId(), item.getConsultationType())
                    .orElseGet(() -> {
                        ConsultationDefaultEntity created = new ConsultationDefaultEntity();
                        created.setTenantId(tenantId);
                        created.setDoctorId(profile.getId());
                        created.setConsultationType(item.getConsultationType());
                        created.setCreatedBy(userId);
                        return created;
                    });

            entity.setFeeAmount(item.getFeeAmount());
            entity.setCurrency(item.getCurrency() != null ? item.getCurrency() : "INR");
            entity.setDurationMinutes(item.getDurationMinutes() != null ? item.getDurationMinutes() : 15);
            entity.setUpdatedBy(userId);
            entity.touch();
            consultationDefaultRepository.save(entity);
        }

        return toFullResponse(profile);
    }

    private DoctorProfileEntity requireEditableProfile(UUID userId, UUID tenantId) {
        DoctorProfileEntity profile = profileProvisioningService.ensureProfileEntity(userId, tenantId);
        if (!"DRAFT".equals(profile.getVerificationStatus())
                && !"REJECTED".equals(profile.getVerificationStatus())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Profile cannot be edited in current verification status");
        }
        return profile;
    }

    private DoctorProfileResponse toFullResponse(DoctorProfileEntity profile) {
        List<QualificationEntity> qualifications = qualificationRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByYearOfCompletionDesc(profile.getId());
        List<ExperienceEntryEntity> experience = experienceRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByStartYearDesc(profile.getId());
        List<ConsultationDefaultEntity> consultations = consultationDefaultRepository
                .findByDoctorIdAndDeletedAtIsNull(profile.getId());
        List<String> languages = languageRepository.findByDoctorIdOrderByLanguageCodeAsc(profile.getId()).stream()
                .map(DoctorLanguageEntity::getLanguageCode)
                .toList();
        List<VerificationDocumentEntity> documents = verificationDocumentRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByUploadedAtDesc(profile.getId());

        Map<UUID, SpecializationEntity> specMap = loadSpecializationMap(profile);
        DoctorProfileResponse response = mapper.toResponse(
                profile, qualifications, experience, consultations, specMap, languages, documents);

        List<UUID> subIds = subSpecializationRepository.findByDoctorId(profile.getId()).stream()
                .map(DoctorSubSpecializationEntity::getSpecializationId)
                .toList();
        List<SpecializationEntity> subs = subIds.isEmpty()
                ? List.of()
                : specializationRepository.findAllById(subIds);

        return mapper.withSubSpecializations(response, subs);
    }

    private Map<UUID, SpecializationEntity> loadSpecializationMap(DoctorProfileEntity profile) {
        Set<UUID> ids = new HashSet<>();
        if (profile.getPrimarySpecializationId() != null) {
            ids.add(profile.getPrimarySpecializationId());
        }
        if (ids.isEmpty()) {
            return Map.of();
        }
        return specializationRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(SpecializationEntity::getId, s -> s));
    }

    private void validateExperienceYears(int startYear, Integer endYear) {
        if (endYear != null && endYear < startYear) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "End year must be greater than or equal to start year");
        }
    }
}
