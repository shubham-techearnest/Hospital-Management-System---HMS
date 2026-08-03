package com.health360.hospital.application.service;

import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.entity.*;
import com.health360.hospital.infrastructure.persistence.repository.*;
import com.health360.hospital.presentation.dto.request.*;
import com.health360.hospital.presentation.dto.response.*;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.shared.infrastructure.persistence.entity.SpecializationEntity;
import com.health360.shared.infrastructure.persistence.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private static final Set<String> HOSPITAL_TYPES = Set.of("GOVERNMENT", "PRIVATE", "TRUST", "CLINIC");
    private static final Set<String> FACILITY_CATEGORIES = Set.of(
            "DIAGNOSTIC", "SURGICAL", "EMERGENCY", "ICU", "PHARMACY", "PARKING", "OTHER");

    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final BranchWorkingHoursRepository workingHoursRepository;
    private final DepartmentRepository departmentRepository;
    private final FacilityRepository facilityRepository;
    private final HospitalAssociationRepository associationRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
    private final HospitalMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public HospitalProfileResponse getProfile(UUID adminUserId, UUID tenantId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        return toProfileResponse(hospital);
    }

    @Transactional
    public HospitalProfileResponse createProfile(UUID adminUserId, UUID tenantId, CreateHospitalProfileRequest request) {
        if (hospitalRepository.findByTenantIdAndAdminUserIdAndDeletedAtIsNull(tenantId, adminUserId).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Hospital profile already exists for this admin");
        }
        validateHospitalType(request.getHospitalType());
        if (hospitalRepository.existsByTenantIdAndRegistrationNumberAndDeletedAtIsNull(
                tenantId, request.getRegistrationNumber())) {
            throw new BusinessException(ErrorCode.DUPLICATE_REGISTRATION, HttpStatus.CONFLICT,
                    "Hospital registration number already in use");
        }

        HospitalEntity entity = new HospitalEntity();
        entity.setTenantId(tenantId);
        entity.setAdminUserId(adminUserId);
        entity.setName(request.getName());
        entity.setRegistrationNumber(request.getRegistrationNumber());
        entity.setHospitalType(request.getHospitalType());
        entity.setEstablishedYear(request.getEstablishedYear());
        entity.setTotalBedCount(request.getTotalBedCount());
        entity.setAccreditation(request.getAccreditation());
        entity.setDescription(request.getDescription());
        entity.setCreatedBy(adminUserId);
        entity.setUpdatedBy(adminUserId);
        entity = hospitalRepository.save(entity);

        auditLogService.record(tenantId, adminUserId, "HOSPITAL_PROFILE_CREATED",
                "Hospital", entity.getId(), Map.of());

        return toProfileResponse(entity);
    }

    @Transactional
    public HospitalProfileResponse updateProfile(UUID adminUserId, UUID tenantId, UpdateHospitalProfileRequest request) {
        HospitalEntity entity = requireHospital(adminUserId, tenantId);
        validateHospitalType(request.getHospitalType());
        entity.setName(request.getName());
        entity.setHospitalType(request.getHospitalType());
        entity.setEstablishedYear(request.getEstablishedYear());
        entity.setTotalBedCount(request.getTotalBedCount());
        entity.setAccreditation(request.getAccreditation());
        entity.setDescription(request.getDescription());
        entity.setUpdatedBy(adminUserId);
        entity.touch();
        entity = hospitalRepository.save(entity);
        return toProfileResponse(entity);
    }

    @Transactional
    public HospitalProfileResponse updateEmergencyInfo(UUID adminUserId, UUID tenantId, UpdateEmergencyInfoRequest request) {
        HospitalEntity entity = requireHospital(adminUserId, tenantId);
        entity.setEmergencyAvailable24x7(request.isEmergencyAvailable24x7());
        entity.setEmergencyPhone(request.getEmergencyPhone());
        entity.setAmbulanceAvailable(request.isAmbulanceAvailable());
        entity.setIcuAvailable(request.isIcuAvailable());
        entity.setIcuBedCount(request.getIcuBedCount());
        entity.setIcuType(request.getIcuType());
        entity.setUpdatedBy(adminUserId);
        entity.touch();
        entity = hospitalRepository.save(entity);
        return toProfileResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<BranchResponse> listBranches(UUID adminUserId, UUID tenantId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        return branchRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospital.getId()).stream()
                .map(b -> mapper.toBranchResponse(b, workingHoursRepository.findByBranchIdOrderByDayOfWeekAsc(b.getId())))
                .toList();
    }

    @Transactional
    public BranchResponse createBranch(UUID adminUserId, UUID tenantId, BranchRequest request) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        BranchEntity branch = mapBranch(new BranchEntity(), hospital, request, tenantId, adminUserId);
        if (request.isPrimary()) {
            clearPrimaryBranch(hospital.getId());
        }
        branch = branchRepository.save(branch);
        saveWorkingHours(branch.getId(), request.getWorkingHours());
        return mapper.toBranchResponse(branch, workingHoursRepository.findByBranchIdOrderByDayOfWeekAsc(branch.getId()));
    }

    @Transactional
    public BranchResponse updateBranch(UUID adminUserId, UUID tenantId, UUID branchId, BranchRequest request) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        BranchEntity branch = branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(branchId, hospital.getId())
                .orElseThrow(notFound("Branch not found"));
        if (request.isPrimary() && !branch.isPrimary()) {
            clearPrimaryBranch(hospital.getId());
        }
        mapBranch(branch, hospital, request, tenantId, adminUserId);
        branch.setUpdatedBy(adminUserId);
        branch.touch();
        branch = branchRepository.save(branch);
        workingHoursRepository.deleteByBranchId(branch.getId());
        saveWorkingHours(branch.getId(), request.getWorkingHours());
        return mapper.toBranchResponse(branch, workingHoursRepository.findByBranchIdOrderByDayOfWeekAsc(branch.getId()));
    }

    @Transactional
    public void deleteBranch(UUID adminUserId, UUID tenantId, UUID branchId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        BranchEntity branch = branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(branchId, hospital.getId())
                .orElseThrow(notFound("Branch not found"));
        if (branchRepository.countByHospitalIdAndDeletedAtIsNull(hospital.getId()) <= 1) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Cannot delete the last branch");
        }
        branch.setDeletedAt(Instant.now());
        branch.setUpdatedBy(adminUserId);
        branchRepository.save(branch);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> listDepartments(UUID adminUserId, UUID tenantId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        return departmentRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospital.getId()).stream()
                .map(mapper::toDepartmentResponse)
                .toList();
    }

    @Transactional
    public DepartmentResponse createDepartment(UUID adminUserId, UUID tenantId, DepartmentRequest request) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        validateUniqueDepartmentName(hospital.getId(), request.getName(), null);
        DepartmentEntity entity = new DepartmentEntity();
        entity.setTenantId(tenantId);
        entity.setHospitalId(hospital.getId());
        applyDepartment(entity, request);
        entity.setCreatedBy(adminUserId);
        entity.setUpdatedBy(adminUserId);
        entity = departmentRepository.save(entity);
        return mapper.toDepartmentResponse(entity);
    }

    @Transactional
    public DepartmentResponse updateDepartment(UUID adminUserId, UUID tenantId, UUID departmentId, DepartmentRequest request) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        DepartmentEntity entity = departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(departmentId, hospital.getId())
                .orElseThrow(notFound("Department not found"));
        validateUniqueDepartmentName(hospital.getId(), request.getName(), entity.getId());
        applyDepartment(entity, request);
        entity.setUpdatedBy(adminUserId);
        entity.touch();
        entity = departmentRepository.save(entity);
        return mapper.toDepartmentResponse(entity);
    }

    @Transactional
    public void deleteDepartment(UUID adminUserId, UUID tenantId, UUID departmentId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        DepartmentEntity entity = departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(departmentId, hospital.getId())
                .orElseThrow(notFound("Department not found"));
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(adminUserId);
        departmentRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<FacilityResponse> listFacilities(UUID adminUserId, UUID tenantId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        return facilityRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospital.getId()).stream()
                .map(mapper::toFacilityResponse)
                .toList();
    }

    @Transactional
    public FacilityResponse createFacility(UUID adminUserId, UUID tenantId, FacilityRequest request) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        validateFacilityCategory(request.getCategory());
        validateBranch(hospital.getId(), request.getBranchId());

        FacilityEntity entity = new FacilityEntity();
        entity.setTenantId(tenantId);
        entity.setHospitalId(hospital.getId());
        applyFacility(entity, request);
        entity.setCreatedBy(adminUserId);
        entity.setUpdatedBy(adminUserId);
        entity = facilityRepository.save(entity);
        return mapper.toFacilityResponse(entity);
    }

    @Transactional
    public FacilityResponse updateFacility(
            UUID adminUserId, UUID tenantId, UUID facilityId, FacilityRequest request) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        validateFacilityCategory(request.getCategory());
        validateBranch(hospital.getId(), request.getBranchId());

        FacilityEntity entity = facilityRepository.findByIdAndHospitalIdAndDeletedAtIsNull(facilityId, hospital.getId())
                .orElseThrow(notFound("Facility not found"));
        applyFacility(entity, request);
        entity.setUpdatedBy(adminUserId);
        entity.touch();
        entity = facilityRepository.save(entity);
        return mapper.toFacilityResponse(entity);
    }

    @Transactional
    public void deleteFacility(UUID adminUserId, UUID tenantId, UUID facilityId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        FacilityEntity entity = facilityRepository.findByIdAndHospitalIdAndDeletedAtIsNull(facilityId, hospital.getId())
                .orElseThrow(notFound("Facility not found"));
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(adminUserId);
        facilityRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<HospitalDoctorResponse> listDoctors(UUID adminUserId, UUID tenantId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        return buildDoctorResponses(hospital.getId(), tenantId,
                associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(hospital.getId()));
    }

    @Transactional
    public HospitalDoctorResponse associateDoctor(UUID adminUserId, UUID tenantId, AssociateDoctorRequest request) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        DoctorProfileEntity doctor = doctorProfileRepository.findByIdAndTenantIdAndDeletedAtIsNull(request.getDoctorId(), tenantId)
                .orElseThrow(notFound("Doctor not found"));
        if (!"VERIFIED".equals(doctor.getVerificationStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Only verified doctors can be associated");
        }
        validateBranchAndDepartment(hospital.getId(), request.getBranchId(), request.getDepartmentId());

        boolean duplicate = associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(hospital.getId())
                .stream()
                .anyMatch(a -> a.getDoctorId().equals(doctor.getId())
                        && "ACTIVE".equals(a.getStatus())
                        && Objects.equals(a.getBranchId(), request.getBranchId()));
        if (duplicate) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Doctor already associated with this hospital/branch");
        }

        HospitalAssociationEntity assoc = new HospitalAssociationEntity();
        assoc.setTenantId(tenantId);
        assoc.setDoctorId(doctor.getId());
        assoc.setHospitalId(hospital.getId());
        assoc.setBranchId(request.getBranchId());
        assoc.setDepartmentId(request.getDepartmentId());
        assoc.setStatus("ACTIVE");
        assoc.setCreatedBy(adminUserId);
        assoc.setUpdatedBy(adminUserId);
        assoc = associationRepository.save(assoc);

        auditLogService.record(tenantId, adminUserId, "HOSPITAL_DOCTOR_ASSOCIATED",
                "HospitalAssociation", assoc.getId(), Map.of("doctorId", doctor.getId()));

        return buildDoctorResponses(hospital.getId(), tenantId, List.of(assoc)).get(0);
    }

    @Transactional
    public void removeDoctorAssociation(UUID adminUserId, UUID tenantId, UUID associationId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        HospitalAssociationEntity assoc = associationRepository.findByIdAndHospitalIdAndDeletedAtIsNull(associationId, hospital.getId())
                .orElseThrow(notFound("Association not found"));
        assoc.setDeletedAt(Instant.now());
        assoc.setUpdatedBy(adminUserId);
        associationRepository.save(assoc);
    }

    @Transactional
    public HospitalDoctorResponse approveDoctorAssociation(UUID adminUserId, UUID tenantId, UUID associationId) {
        HospitalEntity hospital = requireHospital(adminUserId, tenantId);
        HospitalAssociationEntity assoc = associationRepository.findByIdAndHospitalIdAndDeletedAtIsNull(associationId, hospital.getId())
                .orElseThrow(notFound("Association not found"));
        if (!"PENDING".equals(assoc.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Only pending associations can be approved");
        }
        assoc.setStatus("ACTIVE");
        assoc.setUpdatedBy(adminUserId);
        assoc = associationRepository.save(assoc);

        auditLogService.record(tenantId, adminUserId, "HOSPITAL_DOCTOR_ASSOCIATION_APPROVED",
                "HospitalAssociation", assoc.getId(), Map.of("doctorId", assoc.getDoctorId()));

        return buildDoctorResponses(hospital.getId(), tenantId, List.of(assoc)).get(0);
    }

    @Transactional(readOnly = true)
    public List<DoctorSearchResultResponse> searchDoctors(UUID adminUserId, UUID tenantId, String query) {
        requireHospital(adminUserId, tenantId);
        if (query == null || query.isBlank()) {
            return List.of();
        }
        List<DoctorProfileEntity> doctors = doctorProfileRepository.searchVerifiedByRegistrationOrId(
                tenantId, query.trim(), PageRequest.of(0, 20));
        Map<UUID, UserEntity> users = loadUsers(doctors);
        Map<UUID, SpecializationEntity> specs = loadSpecs(doctors);
        return doctors.stream().map(d -> {
            UserEntity u = users.get(d.getUserId());
            SpecializationEntity spec = d.getPrimarySpecializationId() != null
                    ? specs.get(d.getPrimarySpecializationId()) : null;
            return DoctorSearchResultResponse.builder()
                    .doctorId(d.getId())
                    .doctorName(u != null ? u.getFirstName() + " " + u.getLastName() : "Unknown")
                    .medicalRegistrationNumber(d.getMedicalRegistrationNumber())
                    .primarySpecialization(spec != null ? spec.getName() : null)
                    .verificationStatus(d.getVerificationStatus())
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<HospitalProfileResponse> listHospitalsForDoctor(UUID tenantId) {
        return hospitalRepository.findAll().stream()
                .filter(h -> h.getTenantId().equals(tenantId) && h.getDeletedAt() == null)
                .map(this::toProfileResponse)
                .toList();
    }

    private HospitalProfileResponse toProfileResponse(HospitalEntity entity) {
        long branches = branchRepository.countByHospitalIdAndDeletedAtIsNull(entity.getId());
        long departments = departmentRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(entity.getId()).size();
        long doctors = associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(entity.getId()).stream()
                .filter(a -> "ACTIVE".equals(a.getStatus())).count();
        return mapper.toProfileResponse(entity, (int) branches, (int) departments, (int) doctors);
    }

    private List<HospitalDoctorResponse> buildDoctorResponses(UUID hospitalId, UUID tenantId, List<HospitalAssociationEntity> assocs) {
        if (assocs.isEmpty()) return List.of();
        Map<UUID, DoctorProfileEntity> doctors = new HashMap<>();
        Map<UUID, UserEntity> users = new HashMap<>();
        Map<UUID, BranchEntity> branches = new HashMap<>();
        Map<UUID, DepartmentEntity> departments = new HashMap<>();
        Map<UUID, SpecializationEntity> specs = new HashMap<>();

        for (HospitalAssociationEntity a : assocs) {
            doctorProfileRepository.findById(a.getDoctorId()).ifPresent(d -> {
                doctors.put(d.getId(), d);
                userRepository.findById(d.getUserId()).ifPresent(u -> users.put(u.getId(), u));
                if (d.getPrimarySpecializationId() != null) {
                    specializationRepository.findById(d.getPrimarySpecializationId())
                            .ifPresent(s -> specs.put(s.getId(), s));
                }
            });
            if (a.getBranchId() != null) {
                branchRepository.findById(a.getBranchId()).ifPresent(b -> branches.put(b.getId(), b));
            }
            if (a.getDepartmentId() != null) {
                departmentRepository.findById(a.getDepartmentId()).ifPresent(d -> departments.put(d.getId(), d));
            }
        }

        return assocs.stream().map(a -> {
            DoctorProfileEntity d = doctors.get(a.getDoctorId());
            UserEntity u = d != null ? users.get(d.getUserId()) : null;
            BranchEntity b = a.getBranchId() != null ? branches.get(a.getBranchId()) : null;
            DepartmentEntity dept = a.getDepartmentId() != null ? departments.get(a.getDepartmentId()) : null;
            SpecializationEntity spec = d != null && d.getPrimarySpecializationId() != null
                    ? specs.get(d.getPrimarySpecializationId()) : null;
            return HospitalDoctorResponse.builder()
                    .associationId(a.getId())
                    .doctorId(a.getDoctorId())
                    .doctorName(u != null ? u.getFirstName() + " " + u.getLastName() : "Unknown")
                    .medicalRegistrationNumber(d != null ? d.getMedicalRegistrationNumber() : null)
                    .specialization(spec != null ? spec.getName() : null)
                    .branchId(a.getBranchId())
                    .branchName(b != null ? b.getName() : null)
                    .departmentId(a.getDepartmentId())
                    .departmentName(dept != null ? dept.getName() : null)
                    .status(a.getStatus())
                    .build();
        }).toList();
    }

    private Map<UUID, UserEntity> loadUsers(List<DoctorProfileEntity> doctors) {
        Map<UUID, UserEntity> map = new HashMap<>();
        userRepository.findAllById(doctors.stream().map(DoctorProfileEntity::getUserId).toList())
                .forEach(u -> map.put(u.getId(), u));
        return map;
    }

    private Map<UUID, SpecializationEntity> loadSpecs(List<DoctorProfileEntity> doctors) {
        Set<UUID> ids = new HashSet<>();
        doctors.forEach(d -> { if (d.getPrimarySpecializationId() != null) ids.add(d.getPrimarySpecializationId()); });
        Map<UUID, SpecializationEntity> map = new HashMap<>();
        if (!ids.isEmpty()) {
            specializationRepository.findAllById(ids).forEach(s -> map.put(s.getId(), s));
        }
        return map;
    }

    private void validateBranchAndDepartment(UUID hospitalId, UUID branchId, UUID departmentId) {
        if (branchId != null) {
            branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(branchId, hospitalId)
                    .orElseThrow(notFound("Branch not found"));
        }
        if (departmentId != null) {
            departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(departmentId, hospitalId)
                    .orElseThrow(notFound("Department not found"));
        }
    }

    private void validateUniqueDepartmentName(UUID hospitalId, String name, UUID excludeId) {
        departmentRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId).stream()
                .filter(d -> d.getName().equalsIgnoreCase(name) && (excludeId == null || !d.getId().equals(excludeId)))
                .findAny()
                .ifPresent(d -> {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                            "Department name already exists");
                });
    }

    private BranchEntity mapBranch(BranchEntity branch, HospitalEntity hospital, BranchRequest request, UUID tenantId, UUID userId) {
        branch.setTenantId(tenantId);
        branch.setHospitalId(hospital.getId());
        branch.setName(request.getName());
        branch.setAddressLine1(request.getAddressLine1());
        branch.setAddressLine2(request.getAddressLine2());
        branch.setCity(request.getCity());
        branch.setState(request.getState());
        branch.setPincode(request.getPincode());
        branch.setCountry(request.getCountry() != null ? request.getCountry() : "IN");
        branch.setLatitude(request.getLatitude());
        branch.setLongitude(request.getLongitude());
        branch.setPhone(request.getPhone());
        branch.setEmail(request.getEmail());
        branch.setPrimary(request.isPrimary());
        if (branch.getCreatedBy() == null) branch.setCreatedBy(userId);
        branch.setUpdatedBy(userId);
        return branch;
    }

    private void saveWorkingHours(UUID branchId, List<BranchRequest.WorkingHoursItem> items) {
        if (items == null || items.isEmpty()) return;
        for (BranchRequest.WorkingHoursItem item : items) {
            BranchWorkingHoursEntity h = new BranchWorkingHoursEntity();
            h.setBranchId(branchId);
            h.setDayOfWeek(item.getDayOfWeek());
            h.setOpenTime(LocalTime.parse(item.getOpenTime()));
            h.setCloseTime(LocalTime.parse(item.getCloseTime()));
            h.setClosed(item.isClosed());
            workingHoursRepository.save(h);
        }
    }

    private void clearPrimaryBranch(UUID hospitalId) {
        branchRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId).forEach(b -> {
            if (b.isPrimary()) {
                b.setPrimary(false);
                branchRepository.save(b);
            }
        });
    }

    private void applyDepartment(DepartmentEntity entity, DepartmentRequest request) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setFloor(request.getFloor());
        entity.setHeadDoctorId(request.getHeadDoctorId());
        if (request.getActive() != null) entity.setActive(request.getActive());
    }

    private void applyFacility(FacilityEntity entity, FacilityRequest request) {
        entity.setName(request.getName());
        entity.setCategory(request.getCategory().trim().toUpperCase());
        entity.setDescription(request.getDescription());
        entity.setBranchId(request.getBranchId());
        if (request.getAvailable() != null) {
            entity.setAvailable(request.getAvailable());
        }
    }

    private void validateFacilityCategory(String category) {
        if (category == null || !FACILITY_CATEGORIES.contains(category.trim().toUpperCase())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid facility category");
        }
    }

    private void validateBranch(UUID hospitalId, UUID branchId) {
        if (branchId != null) {
            branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(branchId, hospitalId)
                    .orElseThrow(notFound("Branch not found"));
        }
    }

    private void validateHospitalType(String type) {
        if (!HOSPITAL_TYPES.contains(type)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid hospital type");
        }
    }

    HospitalEntity requireHospital(UUID adminUserId, UUID tenantId) {
        return hospitalRepository.findByTenantIdAndAdminUserIdAndDeletedAtIsNull(tenantId, adminUserId)
                .orElseThrow(notFound("Hospital profile not found. Create your hospital profile first."));
    }

    private java.util.function.Supplier<BusinessException> notFound(String msg) {
        return () -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, msg);
    }
}
