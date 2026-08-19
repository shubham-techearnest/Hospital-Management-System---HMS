package com.health360.icu.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.icu.domain.IcuEquipmentStatus;
import com.health360.icu.domain.IcuEquipmentType;
import com.health360.icu.domain.IcuStayStatus;
import com.health360.icu.infrastructure.persistence.entity.IcuEquipmentAssignmentEntity;
import com.health360.icu.infrastructure.persistence.entity.IcuEquipmentEntity;
import com.health360.icu.infrastructure.persistence.entity.IcuStayEntity;
import com.health360.icu.infrastructure.persistence.entity.IcuUnitEntity;
import com.health360.icu.infrastructure.persistence.repository.IcuEquipmentAssignmentRepository;
import com.health360.icu.infrastructure.persistence.repository.IcuEquipmentRepository;
import com.health360.icu.infrastructure.persistence.repository.IcuStayRepository;
import com.health360.icu.presentation.dto.request.AssignIcuEquipmentRequest;
import com.health360.icu.presentation.dto.request.CreateIcuEquipmentRequest;
import com.health360.icu.presentation.dto.response.IcuEquipmentAssignmentResponse;
import com.health360.icu.presentation.dto.response.IcuEquipmentResponse;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IcuEquipmentService {

    private final IcuEquipmentRepository equipmentRepository;
    private final IcuEquipmentAssignmentRepository assignmentRepository;
    private final IcuStayRepository stayRepository;
    private final IcuFacilityService facilityService;
    private final IcuAccessService accessService;
    private final IcuMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public IcuEquipmentResponse createEquipment(UserPrincipal principal, CreateIcuEquipmentRequest request) {
        accessService.assertCanManageEquipment(principal);
        accessService.assertHospitalScope(principal, request.getHospitalId());

        if (equipmentRepository.existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
                request.getHospitalId(), request.getBranchId(), request.getCode().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Equipment code already exists for this branch");
        }

        if (request.getUnitId() != null) {
            IcuUnitEntity unit = facilityService.requireUnit(principal.getTenantId(), request.getUnitId());
            if (!unit.getHospitalId().equals(request.getHospitalId())
                    || !unit.getBranchId().equals(request.getBranchId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Unit does not belong to the specified hospital branch");
            }
        }

        IcuEquipmentEntity equipment = new IcuEquipmentEntity();
        equipment.setTenantId(principal.getTenantId());
        equipment.setHospitalId(request.getHospitalId());
        equipment.setBranchId(request.getBranchId());
        equipment.setUnitId(request.getUnitId());
        equipment.setName(request.getName().trim());
        equipment.setCode(request.getCode().trim().toUpperCase());
        equipment.setEquipmentType(parseEquipmentType(request.getEquipmentType()).name());
        equipment.setStatus(IcuEquipmentStatus.AVAILABLE.name());
        equipment.setCreatedBy(principal.getUserId());
        equipment.setUpdatedBy(principal.getUserId());

        IcuEquipmentEntity saved = equipmentRepository.save(equipment);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ICU_EQUIPMENT_CREATED",
                "IcuEquipment", saved.getId(), Map.of("code", saved.getCode()));
        return mapper.toEquipmentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<IcuEquipmentResponse> listEquipment(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadEquipment(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        return equipmentRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(mapper::toEquipmentResponse)
                .toList();
    }

    @Transactional
    public IcuEquipmentAssignmentResponse assignEquipment(
            UserPrincipal principal, UUID equipmentId, AssignIcuEquipmentRequest request) {
        accessService.assertCanManageEquipment(principal);
        UUID tenantId = principal.getTenantId();

        IcuEquipmentEntity equipment = equipmentRepository.findByIdAndTenantIdAndDeletedAtIsNull(equipmentId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Equipment not found"));
        accessService.assertHospitalScope(principal, equipment.getHospitalId());

        if (!IcuEquipmentStatus.AVAILABLE.name().equals(equipment.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Equipment is not available");
        }

        if (assignmentRepository.existsByEquipmentIdAndActiveTrueAndDeletedAtIsNull(equipmentId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Equipment is already assigned to a patient");
        }

        IcuStayEntity stay = stayRepository.findByIdAndTenantIdAndDeletedAtIsNull(request.getStayId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "ICU stay not found"));
        accessService.assertStayScope(principal, stay);

        if (!IcuStayStatus.ACTIVE.name().equals(stay.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Equipment can only be assigned to active ICU stays");
        }

        IcuEquipmentAssignmentEntity assignment = new IcuEquipmentAssignmentEntity();
        assignment.setTenantId(tenantId);
        assignment.setEquipmentId(equipmentId);
        assignment.setStayId(stay.getId());
        assignment.setAssignedAt(Instant.now());
        assignment.setActive(true);
        assignment.setNotes(trimToNull(request.getNotes()));
        assignment.setCreatedBy(principal.getUserId());
        assignment.setUpdatedBy(principal.getUserId());
        assignmentRepository.save(assignment);

        equipment.setStatus(IcuEquipmentStatus.IN_USE.name());
        equipment.setUpdatedBy(principal.getUserId());
        equipmentRepository.save(equipment);

        auditLogService.record(tenantId, principal.getUserId(), "ICU_EQUIPMENT_ASSIGNED",
                "IcuEquipmentAssignment", assignment.getId(),
                Map.of("equipmentId", equipmentId.toString(), "stayId", stay.getId().toString()));

        return mapper.toEquipmentAssignmentResponse(assignment, equipment);
    }

    @Transactional
    public IcuEquipmentAssignmentResponse releaseEquipment(UserPrincipal principal, UUID assignmentId) {
        accessService.assertCanManageEquipment(principal);
        UUID tenantId = principal.getTenantId();

        IcuEquipmentAssignmentEntity assignment = assignmentRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(assignmentId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Equipment assignment not found"));

        if (!assignment.isActive()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Equipment assignment is already released");
        }

        IcuEquipmentEntity equipment = equipmentRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(assignment.getEquipmentId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Equipment not found"));
        accessService.assertHospitalScope(principal, equipment.getHospitalId());

        Instant now = Instant.now();
        assignment.setActive(false);
        assignment.setReleasedAt(now);
        assignment.setUpdatedBy(principal.getUserId());
        assignmentRepository.save(assignment);

        equipment.setStatus(IcuEquipmentStatus.AVAILABLE.name());
        equipment.setUpdatedBy(principal.getUserId());
        equipmentRepository.save(equipment);

        auditLogService.record(tenantId, principal.getUserId(), "ICU_EQUIPMENT_RELEASED",
                "IcuEquipmentAssignment", assignmentId, Map.of());

        return mapper.toEquipmentAssignmentResponse(assignment, equipment);
    }

    @Transactional(readOnly = true)
    public List<IcuEquipmentAssignmentResponse> listEquipmentAssignments(
            UserPrincipal principal, UUID stayId) {
        accessService.assertCanReadEquipment(principal);
        IcuStayEntity stay = stayRepository.findByIdAndTenantIdAndDeletedAtIsNull(stayId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "ICU stay not found"));
        accessService.assertStayScope(principal, stay);

        return assignmentRepository
                .findByTenantIdAndStayIdAndDeletedAtIsNullOrderByAssignedAtDesc(
                        principal.getTenantId(), stayId)
                .stream()
                .map(a -> {
                    IcuEquipmentEntity eq = equipmentRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(a.getEquipmentId(), principal.getTenantId())
                            .orElseThrow();
                    return mapper.toEquipmentAssignmentResponse(a, eq);
                })
                .toList();
    }

    private IcuEquipmentType parseEquipmentType(String value) {
        if (value == null || value.isBlank()) {
            return IcuEquipmentType.OTHER;
        }
        try {
            return IcuEquipmentType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid equipment type: " + value);
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
