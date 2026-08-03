package com.health360.doctor.application.service;

import com.health360.doctor.application.service.DoctorProfileProvisioningService;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.doctor.presentation.dto.request.CreateHospitalAssociationRequest;
import com.health360.doctor.presentation.dto.response.HospitalAssociationResponse;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.DepartmentEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorHospitalAssociationService {

    private final DoctorProfileProvisioningService profileProvisioningService;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final HospitalAssociationRepository associationRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<HospitalAssociationResponse> listAssociations(UUID userId, UUID tenantId) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        return associationRepository.findByDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(doctor.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public HospitalAssociationResponse createAssociation(UUID userId, UUID tenantId, CreateHospitalAssociationRequest request) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        HospitalEntity hospital = hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(request.getHospitalId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Hospital not found"));

        if (request.getBranchId() != null) {
            branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(request.getBranchId(), hospital.getId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Branch not found"));
        }
        if (request.getDepartmentId() != null) {
            departmentRepository.findByIdAndHospitalIdAndDeletedAtIsNull(request.getDepartmentId(), hospital.getId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Department not found"));
        }

        boolean duplicate = associationRepository.findByDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(doctor.getId())
                .stream()
                .anyMatch(a -> a.getHospitalId().equals(hospital.getId())
                        && Objects.equals(a.getBranchId(), request.getBranchId())
                        && !"INACTIVE".equals(a.getStatus()));
        if (duplicate) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Association already exists");
        }

        HospitalAssociationEntity entity = new HospitalAssociationEntity();
        entity.setTenantId(tenantId);
        entity.setDoctorId(doctor.getId());
        entity.setHospitalId(hospital.getId());
        entity.setBranchId(request.getBranchId());
        entity.setDepartmentId(request.getDepartmentId());
        entity.setStatus("PENDING");
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        entity = associationRepository.save(entity);

        auditLogService.record(tenantId, userId, "DOCTOR_HOSPITAL_ASSOCIATION_REQUESTED",
                "HospitalAssociation", entity.getId(), Map.of("hospitalId", hospital.getId()));

        return toResponse(entity);
    }

    @Transactional
    public void deleteAssociation(UUID userId, UUID tenantId, UUID associationId) {
        DoctorProfileEntity doctor = requireDoctor(userId, tenantId);
        HospitalAssociationEntity entity = associationRepository.findByIdAndDoctorIdAndDeletedAtIsNull(associationId, doctor.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Association not found"));
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        associationRepository.save(entity);
    }

    private HospitalAssociationResponse toResponse(HospitalAssociationEntity entity) {
        HospitalEntity hospital = hospitalRepository.findById(entity.getHospitalId()).orElse(null);
        BranchEntity branch = entity.getBranchId() != null
                ? branchRepository.findById(entity.getBranchId()).orElse(null) : null;
        DepartmentEntity dept = entity.getDepartmentId() != null
                ? departmentRepository.findById(entity.getDepartmentId()).orElse(null) : null;
        return HospitalAssociationResponse.builder()
                .id(entity.getId())
                .hospitalId(entity.getHospitalId())
                .hospitalName(hospital != null ? hospital.getName() : null)
                .branchId(entity.getBranchId())
                .branchName(branch != null ? branch.getName() : null)
                .departmentId(entity.getDepartmentId())
                .departmentName(dept != null ? dept.getName() : null)
                .status(entity.getStatus())
                .build();
    }

    private DoctorProfileEntity requireDoctor(UUID userId, UUID tenantId) {
        return profileProvisioningService.ensureProfileEntity(userId, tenantId);
    }
}
