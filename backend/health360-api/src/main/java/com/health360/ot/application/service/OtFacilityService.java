package com.health360.ot.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.ot.domain.OtTheatreStatus;
import com.health360.ot.infrastructure.persistence.entity.OperationTheatreEntity;
import com.health360.ot.infrastructure.persistence.repository.OperationTheatreRepository;
import com.health360.ot.presentation.dto.request.CreateOperationTheatreRequest;
import com.health360.ot.presentation.dto.response.OperationTheatreResponse;
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
public class OtFacilityService {

    private final OperationTheatreRepository theatreRepository;
    private final OtAccessService accessService;
    private final OtMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public OperationTheatreResponse createTheatre(UserPrincipal principal, CreateOperationTheatreRequest request) {
        accessService.assertCanManageTheatres(principal);
        accessService.assertHospitalScope(principal, request.getHospitalId());

        if (theatreRepository.existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
                request.getHospitalId(), request.getBranchId(), request.getCode().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Theatre code already exists for this branch");
        }

        OperationTheatreEntity theatre = new OperationTheatreEntity();
        theatre.setTenantId(principal.getTenantId());
        theatre.setHospitalId(request.getHospitalId());
        theatre.setBranchId(request.getBranchId());
        theatre.setName(request.getName().trim());
        theatre.setCode(request.getCode().trim().toUpperCase());
        theatre.setStatus(OtTheatreStatus.AVAILABLE.name());
        theatre.setCreatedBy(principal.getUserId());
        theatre.setUpdatedBy(principal.getUserId());

        OperationTheatreEntity saved = theatreRepository.save(theatre);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "OT_THEATRE_CREATED",
                "OperationTheatre", saved.getId(), Map.of("code", saved.getCode()));
        return mapper.toTheatreResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OperationTheatreResponse> listTheatres(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadTheatres(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        return theatreRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(mapper::toTheatreResponse)
                .toList();
    }

    OperationTheatreEntity requireTheatre(UUID tenantId, UUID theatreId) {
        return theatreRepository.findByIdAndTenantIdAndDeletedAtIsNull(theatreId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Operation theatre not found"));
    }
}
