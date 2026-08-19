package com.health360.radiology.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.radiology.domain.ImagingModalityType;
import com.health360.radiology.infrastructure.persistence.entity.ImagingModalityEntity;
import com.health360.radiology.infrastructure.persistence.repository.ImagingModalityRepository;
import com.health360.radiology.presentation.dto.request.CreateImagingModalityRequest;
import com.health360.radiology.presentation.dto.response.ImagingModalityResponse;
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
public class RadiologyCatalogService {

    private final ImagingModalityRepository modalityRepository;
    private final RadiologyAccessService accessService;
    private final RadiologyMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public ImagingModalityResponse createModality(UserPrincipal principal, CreateImagingModalityRequest request) {
        accessService.assertCanManageCatalog(principal);
        accessService.assertHospitalScope(principal, request.getHospitalId());

        if (modalityRepository.existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
                request.getHospitalId(), request.getBranchId(), request.getCode().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Modality code already exists for this branch");
        }

        ImagingModalityEntity modality = new ImagingModalityEntity();
        modality.setTenantId(principal.getTenantId());
        modality.setHospitalId(request.getHospitalId());
        modality.setBranchId(request.getBranchId());
        modality.setCode(request.getCode().trim().toUpperCase());
        modality.setName(request.getName().trim());
        modality.setModalityType(parseModalityType(request.getModalityType()).name());
        modality.setCreatedBy(principal.getUserId());
        modality.setUpdatedBy(principal.getUserId());

        ImagingModalityEntity saved = modalityRepository.save(modality);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IMAGING_MODALITY_CREATED",
                "ImagingModality", saved.getId(), Map.of("code", saved.getCode()));
        return mapper.toModalityResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ImagingModalityResponse> listModalities(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadCatalog(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        return modalityRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(mapper::toModalityResponse)
                .toList();
    }

    ImagingModalityEntity requireModality(UUID tenantId, UUID modalityId) {
        return modalityRepository.findByIdAndTenantIdAndDeletedAtIsNull(modalityId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Imaging modality not found"));
    }

    private ImagingModalityType parseModalityType(String value) {
        if (value == null || value.isBlank()) {
            return ImagingModalityType.X_RAY;
        }
        try {
            return ImagingModalityType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid modality type: " + value);
        }
    }
}
