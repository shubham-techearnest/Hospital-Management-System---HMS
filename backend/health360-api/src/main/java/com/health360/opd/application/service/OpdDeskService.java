package com.health360.opd.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.DepartmentEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.opd.infrastructure.persistence.entity.OpdDeskEntity;
import com.health360.opd.infrastructure.persistence.repository.OpdDeskRepository;
import com.health360.opd.presentation.dto.request.CreateOpdDeskRequest;
import com.health360.opd.presentation.dto.response.OpdDeskResponse;
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
public class OpdDeskService {

    private final OpdDeskRepository deskRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final EncounterAccessService encounterAccessService;
    private final OpdAccessService opdAccessService;
    private final OpdMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public OpdDeskResponse createDesk(UserPrincipal principal, CreateOpdDeskRequest request) {
        opdAccessService.assertCanManageDesks(principal);
        opdAccessService.assertHospitalScope(principal, request.getHospitalId());

        UUID tenantId = principal.getTenantId();
        encounterAccessService.requireHospital(tenantId, request.getHospitalId());
        requireBranch(tenantId, request.getHospitalId(), request.getBranchId());

        if (request.getDepartmentId() != null) {
            requireDepartment(tenantId, request.getHospitalId(), request.getDepartmentId());
        }

        String code = request.getCode().trim().toUpperCase();
        if (deskRepository.existsByTenantIdAndHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
                tenantId, request.getHospitalId(), request.getBranchId(), code)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Desk code already exists for this branch");
        }

        OpdDeskEntity desk = new OpdDeskEntity();
        desk.setTenantId(tenantId);
        desk.setHospitalId(request.getHospitalId());
        desk.setBranchId(request.getBranchId());
        desk.setDepartmentId(request.getDepartmentId());
        desk.setName(request.getName().trim());
        desk.setCode(code);
        desk.setActive(request.getActive() == null || request.getActive());
        desk.setCreatedBy(principal.getUserId());
        desk.setUpdatedBy(principal.getUserId());

        OpdDeskEntity saved = deskRepository.save(desk);

        auditLogService.record(tenantId, principal.getUserId(), "OPD_DESK_CREATED", "OpdDesk", saved.getId(),
                Map.of("code", saved.getCode(), "hospitalId", saved.getHospitalId().toString()));

        return mapper.toDeskResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OpdDeskResponse> listDesks(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        opdAccessService.assertCanReadDesks(principal);
        opdAccessService.assertHospitalScope(principal, hospitalId);

        return deskRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(mapper::toDeskResponse)
                .toList();
    }

    OpdDeskEntity requireActiveDesk(UUID tenantId, UUID deskId, UUID hospitalId, UUID branchId) {
        OpdDeskEntity desk = deskRepository.findByIdAndTenantIdAndDeletedAtIsNull(deskId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "OPD desk not found"));

        if (!desk.getHospitalId().equals(hospitalId) || !desk.getBranchId().equals(branchId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Desk does not belong to the specified hospital/branch");
        }
        if (!desk.isActive()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "OPD desk is not active");
        }
        return desk;
    }

    private void requireBranch(UUID tenantId, UUID hospitalId, UUID branchId) {
        BranchEntity branch = branchRepository.findById(branchId)
                .filter(b -> b.getDeletedAt() == null && b.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Branch not found"));
        if (!branch.getHospitalId().equals(hospitalId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Branch does not belong to the specified hospital");
        }
    }

    private void requireDepartment(UUID tenantId, UUID hospitalId, UUID departmentId) {
        DepartmentEntity department = departmentRepository.findById(departmentId)
                .filter(d -> d.getDeletedAt() == null && d.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Department not found"));
        if (!department.getHospitalId().equals(hospitalId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Department does not belong to the specified hospital");
        }
    }
}
