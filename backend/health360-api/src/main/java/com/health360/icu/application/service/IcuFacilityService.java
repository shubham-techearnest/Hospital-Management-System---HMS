package com.health360.icu.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.icu.domain.IcuBedStatus;
import com.health360.icu.infrastructure.persistence.entity.IcuBedEntity;
import com.health360.icu.infrastructure.persistence.entity.IcuUnitEntity;
import com.health360.icu.infrastructure.persistence.repository.IcuBedRepository;
import com.health360.icu.infrastructure.persistence.repository.IcuUnitRepository;
import com.health360.icu.presentation.dto.request.CreateIcuBedRequest;
import com.health360.icu.presentation.dto.request.CreateIcuUnitRequest;
import com.health360.icu.presentation.dto.response.IcuBedResponse;
import com.health360.icu.presentation.dto.response.IcuUnitResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IcuFacilityService {

    private final IcuUnitRepository unitRepository;
    private final IcuBedRepository bedRepository;
    private final IcuAccessService accessService;
    private final IcuMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public IcuUnitResponse createUnit(UserPrincipal principal, CreateIcuUnitRequest request) {
        accessService.assertCanManageUnits(principal);
        accessService.assertHospitalScope(principal, request.getHospitalId());

        if (unitRepository.existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
                request.getHospitalId(), request.getBranchId(), request.getCode().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "ICU unit code already exists for this branch");
        }

        IcuUnitEntity unit = new IcuUnitEntity();
        unit.setTenantId(principal.getTenantId());
        unit.setHospitalId(request.getHospitalId());
        unit.setBranchId(request.getBranchId());
        unit.setName(request.getName().trim());
        unit.setCode(request.getCode().trim().toUpperCase());
        unit.setCreatedBy(principal.getUserId());
        unit.setUpdatedBy(principal.getUserId());

        IcuUnitEntity saved = unitRepository.save(unit);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "ICU_UNIT_CREATED",
                "IcuUnit", saved.getId(), Map.of("code", saved.getCode()));
        return mapper.toUnitResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<IcuUnitResponse> listUnits(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadUnits(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        return unitRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(mapper::toUnitResponse)
                .toList();
    }

    @Transactional
    public IcuBedResponse createBed(UserPrincipal principal, CreateIcuBedRequest request) {
        accessService.assertCanManageUnits(principal);
        IcuUnitEntity unit = requireUnit(principal.getTenantId(), request.getUnitId());
        accessService.assertUnitScope(principal, unit);

        if (bedRepository.existsByUnitIdAndBedNumberAndDeletedAtIsNull(
                unit.getId(), request.getBedNumber().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Bed number already exists in this unit");
        }

        IcuBedEntity bed = new IcuBedEntity();
        bed.setTenantId(principal.getTenantId());
        bed.setUnitId(unit.getId());
        bed.setBedNumber(request.getBedNumber().trim());
        bed.setStatus(IcuBedStatus.AVAILABLE.name());
        bed.setCreatedBy(principal.getUserId());
        bed.setUpdatedBy(principal.getUserId());

        return mapper.toBedResponse(bedRepository.save(bed), unit);
    }

    @Transactional(readOnly = true)
    public List<IcuBedResponse> listBeds(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status) {
        accessService.assertCanReadUnits(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        String normalizedStatus = status != null && !status.isBlank() ? status.trim().toUpperCase() : null;
        return bedRepository.findByHospitalBranch(
                        principal.getTenantId(), hospitalId, branchId, normalizedStatus)
                .stream()
                .map(bed -> {
                    IcuUnitEntity unit = requireUnit(principal.getTenantId(), bed.getUnitId());
                    return mapper.toBedResponse(bed, unit);
                })
                .toList();
    }

    IcuUnitEntity requireUnit(UUID tenantId, UUID unitId) {
        return unitRepository.findByIdAndTenantIdAndDeletedAtIsNull(unitId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "ICU unit not found"));
    }

    IcuBedEntity requireBed(UUID tenantId, UUID bedId) {
        return bedRepository.findByIdAndTenantIdAndDeletedAtIsNull(bedId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "ICU bed not found"));
    }

    IcuBedEntity requireAvailableBed(UUID tenantId, UUID bedId) {
        IcuBedEntity bed = requireBed(tenantId, bedId);
        if (!IcuBedStatus.AVAILABLE.name().equals(bed.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "ICU bed is not available");
        }
        return bed;
    }

    void occupyBed(IcuBedEntity bed, UUID userId) {
        bed.setStatus(IcuBedStatus.OCCUPIED.name());
        bed.setUpdatedBy(userId);
        bedRepository.save(bed);
    }

    void releaseBed(IcuBedEntity bed, UUID userId) {
        bed.setStatus(IcuBedStatus.AVAILABLE.name());
        bed.setUpdatedBy(userId);
        bedRepository.save(bed);
    }
}
