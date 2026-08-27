package com.health360.hospital.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.DiagnosisCatalogEntity;
import com.health360.hospital.infrastructure.persistence.entity.DosageTemplateEntity;
import com.health360.hospital.infrastructure.persistence.entity.SymptomCatalogEntity;
import com.health360.hospital.infrastructure.persistence.repository.DiagnosisCatalogRepository;
import com.health360.hospital.infrastructure.persistence.repository.DosageTemplateRepository;
import com.health360.hospital.infrastructure.persistence.repository.SymptomCatalogRepository;
import com.health360.hospital.presentation.dto.request.CreateDiagnosisCatalogRequest;
import com.health360.hospital.presentation.dto.request.CreateDosageTemplateRequest;
import com.health360.hospital.presentation.dto.request.CreateSymptomCatalogRequest;
import com.health360.hospital.presentation.dto.response.DiagnosisCatalogResponse;
import com.health360.hospital.presentation.dto.response.DosageTemplateResponse;
import com.health360.hospital.presentation.dto.response.SymptomCatalogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class HospitalClinicalCatalogService {

    private final SymptomCatalogRepository symptomCatalogRepository;
    private final DosageTemplateRepository dosageTemplateRepository;
    private final DiagnosisCatalogRepository diagnosisCatalogRepository;
    private final HospitalClinicalCatalogAccessService accessService;

    @Transactional(readOnly = true)
    public List<SymptomCatalogResponse> listSymptoms(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadCatalog(principal);
        accessService.assertCatalogHospitalAccess(principal, hospitalId);

        return dedupe(
                symptomCatalogRepository
                        .findActiveCatalog(principal.getTenantId(), hospitalId, branchId)
                        .stream()
                        .map(this::toSymptomResponse)
                        .toList(),
                item -> key(item.getCode(), item.getName()),
                SymptomCatalogResponse::getHospitalId);
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

        return dedupe(
                dosageTemplateRepository
                        .findActiveCatalog(principal.getTenantId(), hospitalId, branchId)
                        .stream()
                        .map(this::toDosageResponse)
                        .toList(),
                DosageTemplateResponse::getLabel,
                DosageTemplateResponse::getHospitalId);
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

    @Transactional(readOnly = true)
    public List<DiagnosisCatalogResponse> listDiagnoses(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String query) {
        accessService.assertCanReadCatalog(principal);
        accessService.assertCatalogHospitalAccess(principal, hospitalId);

        String needle = query == null ? "" : query.trim().toLowerCase();
        return dedupe(
                diagnosisCatalogRepository
                        .findActiveCatalog(principal.getTenantId(), hospitalId, branchId)
                        .stream()
                        .filter(entity -> needle.isEmpty() || matchesDiagnosisQuery(entity, needle))
                        .map(this::toDiagnosisResponse)
                        .toList(),
                DiagnosisCatalogResponse::getIcdCode,
                DiagnosisCatalogResponse::getHospitalId);
    }

    @Transactional
    public DiagnosisCatalogResponse createDiagnosis(UserPrincipal principal, CreateDiagnosisCatalogRequest request) {
        accessService.assertCanWriteCatalog(principal);
        accessService.assertCatalogHospitalAccess(principal, request.getHospitalId());

        DiagnosisCatalogEntity entity = new DiagnosisCatalogEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setIcdCode(request.getIcdCode().trim().toUpperCase());
        entity.setName(request.getName().trim());
        entity.setCategory(blankToNull(request.getCategory()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        return toDiagnosisResponse(diagnosisCatalogRepository.save(entity));
    }

    private static boolean matchesDiagnosisQuery(DiagnosisCatalogEntity entity, String needle) {
        return (entity.getIcdCode() != null && entity.getIcdCode().toLowerCase().contains(needle))
                || (entity.getName() != null && entity.getName().toLowerCase().contains(needle))
                || (entity.getCategory() != null && entity.getCategory().toLowerCase().contains(needle));
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

    private DiagnosisCatalogResponse toDiagnosisResponse(DiagnosisCatalogEntity entity) {
        return DiagnosisCatalogResponse.builder()
                .diagnosisCatalogId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .icdCode(entity.getIcdCode())
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

    private static <T> List<T> dedupe(
            List<T> items,
            Function<T, String> keyFn,
            Function<T, UUID> hospitalIdFn) {
        Map<String, T> byKey = new LinkedHashMap<>();
        for (T item : items) {
            String raw = keyFn.apply(item);
            String key = raw == null ? "" : raw.trim().toLowerCase();
            T existing = byKey.get(key);
            if (existing == null || (hospitalIdFn.apply(existing) == null && hospitalIdFn.apply(item) != null)) {
                byKey.put(key, item);
            }
        }
        return List.copyOf(byKey.values());
    }

    private static String key(String code, String name) {
        if (code != null && !code.isBlank()) {
            return code;
        }
        return name == null ? "" : name;
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
