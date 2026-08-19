package com.health360.laboratory.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.laboratory.domain.LabSpecimenType;
import com.health360.laboratory.infrastructure.persistence.entity.LabTestEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabTestParameterEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LaboratoryEntity;
import com.health360.laboratory.infrastructure.persistence.repository.*;
import com.health360.laboratory.presentation.dto.request.*;
import com.health360.laboratory.presentation.dto.response.*;
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
public class LabCatalogService {

    private final LaboratoryRepository laboratoryRepository;
    private final LabTestRepository testRepository;
    private final LabTestParameterRepository parameterRepository;
    private final LabAccessService accessService;
    private final LabMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public LaboratoryResponse createLaboratory(UserPrincipal principal, CreateLaboratoryRequest request) {
        accessService.assertCanManageCatalog(principal);
        accessService.assertHospitalScope(principal, request.getHospitalId());

        if (laboratoryRepository.existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
                request.getHospitalId(), request.getBranchId(), request.getCode().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Laboratory code already exists for this branch");
        }

        LaboratoryEntity lab = new LaboratoryEntity();
        lab.setTenantId(principal.getTenantId());
        lab.setHospitalId(request.getHospitalId());
        lab.setBranchId(request.getBranchId());
        lab.setName(request.getName().trim());
        lab.setCode(request.getCode().trim().toUpperCase());
        lab.setCreatedBy(principal.getUserId());
        lab.setUpdatedBy(principal.getUserId());

        LaboratoryEntity saved = laboratoryRepository.save(lab);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "LABORATORY_CREATED",
                "Laboratory", saved.getId(), Map.of("code", saved.getCode()));
        return mapper.toLaboratoryResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LaboratoryResponse> listLaboratories(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadCatalog(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        return laboratoryRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(mapper::toLaboratoryResponse)
                .toList();
    }

    @Transactional
    public LabTestResponse createTest(UserPrincipal principal, CreateLabTestRequest request) {
        accessService.assertCanManageCatalog(principal);
        LaboratoryEntity laboratory = requireLaboratory(principal.getTenantId(), request.getLaboratoryId());
        accessService.assertHospitalScope(principal, laboratory.getHospitalId());

        if (testRepository.existsByLaboratoryIdAndCodeAndDeletedAtIsNull(
                laboratory.getId(), request.getCode().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Test code already exists in this laboratory");
        }

        LabTestEntity test = new LabTestEntity();
        test.setTenantId(principal.getTenantId());
        test.setLaboratoryId(laboratory.getId());
        test.setCode(request.getCode().trim().toUpperCase());
        test.setName(request.getName().trim());
        test.setSpecimenType(parseSpecimenType(request.getSpecimenType()).name());
        test.setCreatedBy(principal.getUserId());
        test.setUpdatedBy(principal.getUserId());

        return mapper.toTestResponse(testRepository.save(test));
    }

    @Transactional(readOnly = true)
    public List<LabTestResponse> listTests(UserPrincipal principal, UUID laboratoryId) {
        accessService.assertCanReadCatalog(principal);
        LaboratoryEntity laboratory = requireLaboratory(principal.getTenantId(), laboratoryId);
        accessService.assertHospitalScope(principal, laboratory.getHospitalId());
        return testRepository.findByTenantIdAndLaboratoryIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), laboratoryId)
                .stream()
                .map(mapper::toTestResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LabTestResponse> listTestsForBranch(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadCatalog(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        return testRepository.findActiveByHospitalBranch(principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(mapper::toTestResponse)
                .toList();
    }

    @Transactional
    public LabTestParameterResponse createParameter(
            UserPrincipal principal, CreateLabTestParameterRequest request) {
        accessService.assertCanManageCatalog(principal);
        LabTestEntity test = requireTest(principal.getTenantId(), request.getLabTestId());
        LaboratoryEntity laboratory = requireLaboratory(principal.getTenantId(), test.getLaboratoryId());
        accessService.assertHospitalScope(principal, laboratory.getHospitalId());

        if (parameterRepository.existsByLabTestIdAndCodeAndDeletedAtIsNull(
                test.getId(), request.getCode().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Parameter code already exists for this test");
        }

        LabTestParameterEntity parameter = new LabTestParameterEntity();
        parameter.setTenantId(principal.getTenantId());
        parameter.setLabTestId(test.getId());
        parameter.setCode(request.getCode().trim().toUpperCase());
        parameter.setName(request.getName().trim());
        parameter.setUnit(trimToNull(request.getUnit()));
        parameter.setReferenceRange(trimToNull(request.getReferenceRange()));
        parameter.setCreatedBy(principal.getUserId());
        parameter.setUpdatedBy(principal.getUserId());

        return mapper.toParameterResponse(parameterRepository.save(parameter));
    }

    @Transactional(readOnly = true)
    public List<LabTestParameterResponse> listParameters(UserPrincipal principal, UUID labTestId) {
        accessService.assertCanReadCatalog(principal);
        LabTestEntity test = requireTest(principal.getTenantId(), labTestId);
        LaboratoryEntity laboratory = requireLaboratory(principal.getTenantId(), test.getLaboratoryId());
        accessService.assertHospitalScope(principal, laboratory.getHospitalId());
        return parameterRepository.findByTenantIdAndLabTestIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), labTestId)
                .stream()
                .map(mapper::toParameterResponse)
                .toList();
    }

    LaboratoryEntity requireLaboratory(UUID tenantId, UUID laboratoryId) {
        return laboratoryRepository.findByIdAndTenantIdAndDeletedAtIsNull(laboratoryId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Laboratory not found"));
    }

    LabTestEntity requireTest(UUID tenantId, UUID labTestId) {
        return testRepository.findByIdAndTenantIdAndDeletedAtIsNull(labTestId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Lab test not found"));
    }

    private LabSpecimenType parseSpecimenType(String value) {
        if (value == null || value.isBlank()) {
            return LabSpecimenType.BLOOD;
        }
        try {
            return LabSpecimenType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid specimen type: " + value);
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
