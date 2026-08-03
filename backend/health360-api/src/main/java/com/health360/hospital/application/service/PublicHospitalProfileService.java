package com.health360.hospital.application.service;

import com.health360.config.Health360Properties;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.BranchWorkingHoursEntity;
import com.health360.hospital.infrastructure.persistence.entity.DepartmentEntity;
import com.health360.hospital.infrastructure.persistence.entity.FacilityEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.BranchWorkingHoursRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.hospital.infrastructure.persistence.repository.FacilityRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.hospital.presentation.dto.response.BranchResponse;
import com.health360.hospital.presentation.dto.response.DepartmentResponse;
import com.health360.hospital.presentation.dto.response.FacilityResponse;
import com.health360.hospital.presentation.dto.response.GalleryImageResponse;
import com.health360.hospital.presentation.dto.response.PagedPublicHospitalDoctorResponse;
import com.health360.hospital.presentation.dto.response.PublicHospitalProfileResponse;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
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
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicHospitalProfileService {

    private static final String VERIFIED = "VERIFIED";
    private static final String ACTIVE = "ACTIVE";

    private final Health360Properties health360Properties;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final BranchWorkingHoursRepository workingHoursRepository;
    private final DepartmentRepository departmentRepository;
    private final FacilityRepository facilityRepository;
    private final HospitalAssociationRepository hospitalAssociationRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
    private final HospitalMapper hospitalMapper;
    private final HospitalGalleryService hospitalGalleryService;

    @Transactional(readOnly = true)
    public PublicHospitalProfileResponse getPublicProfile(UUID hospitalId) {
        UUID tenantId = health360Properties.getDefaultTenantId();
        HospitalEntity hospital = hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Hospital not found"));

        List<BranchEntity> branchEntities = branchRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId);
        List<BranchResponse> branches = branchEntities.stream()
                .map(branch -> {
                    List<BranchWorkingHoursEntity> hours =
                            workingHoursRepository.findByBranchIdOrderByDayOfWeekAsc(branch.getId());
                    return hospitalMapper.toBranchResponse(branch, hours);
                })
                .toList();

        List<DepartmentResponse> departments = departmentRepository
                .findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId)
                .stream()
                .filter(DepartmentEntity::isActive)
                .map(hospitalMapper::toDepartmentResponse)
                .toList();

        List<FacilityResponse> facilities = facilityRepository
                .findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId)
                .stream()
                .filter(FacilityEntity::isAvailable)
                .map(hospitalMapper::toFacilityResponse)
                .toList();

        List<GalleryImageResponse> gallery = hospitalGalleryService.listPublicGallery(hospitalId);

        List<PublicHospitalProfileResponse.PublicHospitalDoctorSummary> featuredDoctors =
                listDoctors(hospitalId, null, null, 0, 6).getContent().stream()
                        .map(d -> PublicHospitalProfileResponse.PublicHospitalDoctorSummary.builder()
                                .doctorId(d.getDoctorId())
                                .name(d.getName())
                                .specialization(d.getSpecialization())
                                .averageRating(d.getAverageRating())
                                .reviewCount(d.getReviewCount())
                                .build())
                        .toList();

        BigDecimal rating = hospital.getAverageRating() != null
                ? hospital.getAverageRating().setScale(1, RoundingMode.HALF_UP)
                : null;

        return PublicHospitalProfileResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .hospitalType(hospital.getHospitalType())
                .establishedYear(hospital.getEstablishedYear())
                .totalBedCount(hospital.getTotalBedCount())
                .accreditation(hospital.getAccreditation())
                .description(hospital.getDescription())
                .averageRating(rating)
                .reviewCount(hospital.getReviewCount())
                .emergencyInfo(PublicHospitalProfileResponse.EmergencyInfo.builder()
                        .emergencyAvailable24x7(hospital.isEmergencyAvailable24x7())
                        .emergencyPhone(hospital.getEmergencyPhone())
                        .ambulanceAvailable(hospital.isAmbulanceAvailable())
                        .icuAvailable(hospital.isIcuAvailable())
                        .icuBedCount(hospital.getIcuBedCount())
                        .icuType(hospital.getIcuType())
                        .build())
                .branches(branches)
                .departments(departments)
                .facilities(facilities)
                .gallery(gallery)
                .featuredDoctors(featuredDoctors)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedPublicHospitalDoctorResponse listDoctors(
            UUID hospitalId,
            UUID departmentId,
            String specializationQuery,
            int page,
            int size) {
        UUID tenantId = health360Properties.getDefaultTenantId();
        if (hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId).isEmpty()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Hospital not found");
        }

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        List<HospitalAssociationEntity> associations = hospitalAssociationRepository
                .findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(hospitalId)
                .stream()
                .filter(a -> ACTIVE.equals(a.getStatus()))
                .filter(a -> departmentId == null || departmentId.equals(a.getDepartmentId()))
                .toList();

        if (associations.isEmpty()) {
            return emptyDoctorPage(safePage, safeSize);
        }

        Set<UUID> doctorIds = associations.stream()
                .map(HospitalAssociationEntity::getDoctorId)
                .collect(Collectors.toSet());

        Map<UUID, DoctorProfileEntity> doctors = doctorProfileRepository.findAllById(doctorIds).stream()
                .filter(d -> d.getDeletedAt() == null)
                .filter(d -> VERIFIED.equals(d.getVerificationStatus()))
                .collect(Collectors.toMap(DoctorProfileEntity::getId, Function.identity()));

        Map<UUID, UUID> doctorDepartments = new HashMap<>();
        associations.stream()
                .filter(a -> doctors.containsKey(a.getDoctorId()))
                .forEach(a -> doctorDepartments.putIfAbsent(a.getDoctorId(), a.getDepartmentId()));

        Map<UUID, DepartmentEntity> departments = departmentRepository
                .findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId)
                .stream()
                .collect(Collectors.toMap(DepartmentEntity::getId, Function.identity()));

        Map<UUID, UserEntity> users = userRepository.findAllById(
                        doctors.values().stream().map(DoctorProfileEntity::getUserId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(UserEntity::getId, Function.identity()));

        Set<UUID> specializationIds = doctors.values().stream()
                .map(DoctorProfileEntity::getPrimarySpecializationId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, SpecializationEntity> specializations = specializationIds.isEmpty()
                ? Map.of()
                : specializationRepository.findAllById(specializationIds).stream()
                        .collect(Collectors.toMap(SpecializationEntity::getId, Function.identity()));

        String specFilter = specializationQuery != null ? specializationQuery.trim().toLowerCase() : null;

        List<PagedPublicHospitalDoctorResponse.PublicHospitalDoctorSummary> summaries = doctors.values().stream()
                .map(doctor -> {
                    UserEntity user = users.get(doctor.getUserId());
                    if (user == null) {
                        return null;
                    }
                    SpecializationEntity spec = doctor.getPrimarySpecializationId() != null
                            ? specializations.get(doctor.getPrimarySpecializationId())
                            : null;
                    String specName = spec != null ? spec.getName() : null;
                    if (specFilter != null && !specFilter.isBlank()) {
                        boolean matches = specName != null && specName.toLowerCase().contains(specFilter);
                        if (!matches) {
                            return null;
                        }
                    }
                    UUID deptId = doctorDepartments.get(doctor.getId());
                    DepartmentEntity dept = deptId != null ? departments.get(deptId) : null;
                    BigDecimal rating = doctor.getAverageRating() != null
                            ? doctor.getAverageRating().setScale(1, RoundingMode.HALF_UP)
                            : null;
                    return PagedPublicHospitalDoctorResponse.PublicHospitalDoctorSummary.builder()
                            .doctorId(doctor.getId())
                            .name((user.getFirstName() + " " + user.getLastName()).trim())
                            .specialization(specName)
                            .department(dept != null ? dept.getName() : null)
                            .averageRating(rating)
                            .reviewCount(doctor.getReviewCount())
                            .yearsExperience(doctor.getTotalYearsExperience())
                            .build();
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(PagedPublicHospitalDoctorResponse.PublicHospitalDoctorSummary::getName))
                .toList();

        int from = Math.min(safePage * safeSize, summaries.size());
        int to = Math.min(from + safeSize, summaries.size());
        List<PagedPublicHospitalDoctorResponse.PublicHospitalDoctorSummary> pageContent = summaries.subList(from, to);
        int totalPages = summaries.isEmpty() ? 0 : (int) Math.ceil((double) summaries.size() / safeSize);

        return PagedPublicHospitalDoctorResponse.builder()
                .content(pageContent)
                .page(safePage)
                .size(safeSize)
                .totalElements(summaries.size())
                .totalPages(totalPages)
                .build();
    }

    private PagedPublicHospitalDoctorResponse emptyDoctorPage(int page, int size) {
        return PagedPublicHospitalDoctorResponse.builder()
                .content(List.of())
                .page(page)
                .size(size)
                .totalElements(0)
                .totalPages(0)
                .build();
    }
}
