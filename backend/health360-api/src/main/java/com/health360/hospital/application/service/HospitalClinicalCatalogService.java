package com.health360.hospital.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.DosageTemplateEntity;
import com.health360.hospital.infrastructure.persistence.entity.SymptomCatalogEntity;
import com.health360.hospital.infrastructure.persistence.repository.DosageTemplateRepository;
import com.health360.hospital.infrastructure.persistence.repository.SymptomCatalogRepository;
import com.health360.hospital.presentation.dto.request.CreateDosageTemplateRequest;
import com.health360.hospital.presentation.dto.request.CreateSymptomCatalogRequest;
import com.health360.hospital.presentation.dto.response.DosageTemplateResponse;
import com.health360.hospital.presentation.dto.response.SymptomCatalogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalClinicalCatalogService {

    private final SymptomCatalogRepository symptomCatalogRepository;
    private final DosageTemplateRepository dosageTemplateRepository;
    private final HospitalClinicalCatalogAccessService accessService;

    @Transactional(readOnly = true)
    public List<SymptomCatalogResponse> listSymptoms(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadCatalog(principal);
        accessService.assertCatalogHospitalAccess(principal, hospitalId);

        return symptomCatalogRepository
                .findActiveCatalog(principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(this::toSymptomResponse)
                .toList();
    }

    @Transactional
    public SymptomCatalogResponse createSymptom(UserPrincipal principal, CreateSymptomCatalogRequest request) {
        accessService.assertCanWriteCatalog(principal);
        accessService.assertCatalogHospitalAccess(principal, request.getHospitalId());

        SymptomCatalogEntity entity = new SymptomCatalogEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setCode(blankToNull(request.getCode()));
        entity.setName(request.getName().trim());
        entity.setCategory(blankToNull(request.getCategory()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        return toSymptomResponse(symptomCatalogRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<DosageTemplateResponse> listDosageTemplates(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadCatalog(principal);
        accessService.assertCatalogHospitalAccess(principal, hospitalId);

        return dosageTemplateRepository
                .findActiveCatalog(principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(this::toDosageResponse)
                .toList();
    }

    @Transactional
    public DosageTemplateResponse createDosageTemplate(
            UserPrincipal principal, CreateDosageTemplateRequest request) {
        accessService.assertCanWriteCatalog(principal);
        accessService.assertCatalogHospitalAccess(principal, request.getHospitalId());

        DosageTemplateEntity entity = new DosageTemplateEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setLabel(request.getLabel().trim());
        entity.setDoseText(blankToNull(request.getDoseText()));
        entity.setRoute(request.getRoute() != null ? request.getRoute().trim().toUpperCase() : null);
        entity.setFrequency(blankToNull(request.getFrequency()));
        entity.setDurationDays(request.getDurationDays());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        return toDosageResponse(dosageTemplateRepository.save(entity));
    }

    private SymptomCatalogResponse toSymptomResponse(SymptomCatalogEntity entity) {
        return SymptomCatalogResponse.builder()
                .symptomId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .code(entity.getCode())
                .name(entity.getName())
                .category(entity.getCategory())
                .active(entity.isActive())
                .build();
    }

    private DosageTemplateResponse toDosageResponse(DosageTemplateEntity entity) {
        return DosageTemplateResponse.builder()
                .dosageTemplateId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .label(entity.getLabel())
                .doseText(entity.getDoseText())
                .route(entity.getRoute())
                .frequency(entity.getFrequency())
                .durationDays(entity.getDurationDays())
                .active(entity.isActive())
                .build();
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
