package com.health360.ipd.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.ipd.domain.IpdServiceKeys;
import com.health360.ipd.domain.IpdServicePresets;
import com.health360.ipd.infrastructure.persistence.entity.HospitalIpdServiceSettingsEntity;
import com.health360.ipd.infrastructure.persistence.repository.HospitalIpdServiceSettingsRepository;
import com.health360.ipd.presentation.dto.request.ApplyIpdServicePresetRequest;
import com.health360.ipd.presentation.dto.request.UpdateHospitalIpdServicesRequest;
import com.health360.ipd.presentation.dto.response.HospitalIpdServicesResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IpdServiceCatalogService {

    private final HospitalIpdServiceSettingsRepository settingsRepository;
    private final HospitalRepository hospitalRepository;
    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;
    private final IpdAccessService accessService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public HospitalIpdServicesResponse getSettings(UserPrincipal principal, UUID hospitalId) {
        accessService.assertCanReadSettings(principal);
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
        HospitalIpdServiceSettingsEntity entity = requireOrCreate(principal, hospitalId);
        return toResponse(principal, entity);
    }

    @Transactional
    public HospitalIpdServicesResponse updateSettings(
            UserPrincipal principal, UUID hospitalId, UpdateHospitalIpdServicesRequest request) {
        accessService.assertCanManageSettings(principal);
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_IPD,
                "IPD is not included in this hospital's subscription plan");

        HospitalIpdServiceSettingsEntity entity = requireOrCreate(principal, hospitalId);
        Map<String, Boolean> normalized = normalizeServices(request.getEnabledServices());
        if (!Boolean.TRUE.equals(normalized.get(IpdServiceKeys.IPD_CORE))) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR,
                    HttpStatus.BAD_REQUEST,
                    "IPD_CORE must remain enabled while the hospital uses inpatient services. "
                            + "Disable FEATURE_IPD on the plan to turn off the module.");
        }

        entity.setEnabledServices(normalized);
        entity.setCountryCode(request.getCountryCode().trim().toUpperCase(Locale.ROOT));
        if (request.getPresetCode() != null && !request.getPresetCode().isBlank()) {
            entity.setPresetCode(IpdServicePresets.normalize(request.getPresetCode()));
        } else {
            entity.setPresetCode(null);
        }
        if (request.getCountryConfig() != null) {
            entity.setCountryConfig(new LinkedHashMap<>(request.getCountryConfig()));
        }
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        HospitalIpdServiceSettingsEntity saved = settingsRepository.save(entity);

        auditLogService.record(
                principal.getTenantId(),
                principal.getUserId(),
                "IPD_SERVICE_SETTINGS_UPDATED",
                "HospitalIpdServiceSettings",
                saved.getId(),
                Map.of("hospitalId", hospitalId.toString(), "preset", String.valueOf(saved.getPresetCode())));

        return toResponse(principal, saved);
    }

    @Transactional
    public HospitalIpdServicesResponse applyPreset(
            UserPrincipal principal, UUID hospitalId, ApplyIpdServicePresetRequest request) {
        accessService.assertCanManageSettings(principal);
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_IPD,
                "IPD is not included in this hospital's subscription plan");

        String preset = IpdServicePresets.normalize(request.getPresetCode());
        HospitalIpdServiceSettingsEntity entity = requireOrCreate(principal, hospitalId);
        entity.setPresetCode(preset);
        entity.setEnabledServices(IpdServicePresets.forPreset(preset));
        if (entity.getCountryConfig() == null || entity.getCountryConfig().isEmpty()) {
            entity.setCountryConfig(IpdServicePresets.defaultIndiaCountryConfig());
        }
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        HospitalIpdServiceSettingsEntity saved = settingsRepository.save(entity);

        auditLogService.record(
                principal.getTenantId(),
                principal.getUserId(),
                "IPD_SERVICE_PRESET_APPLIED",
                "HospitalIpdServiceSettings",
                saved.getId(),
                Map.of("hospitalId", hospitalId.toString(), "preset", preset));

        return toResponse(principal, saved);
    }

    @Transactional(readOnly = true)
    public boolean isServiceEnabled(UUID hospitalId, UUID tenantId, String serviceKey) {
        return settingsRepository
                .findByHospitalIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId)
                .map(entity -> Boolean.TRUE.equals(
                        normalizeServices(entity.getEnabledServices()).get(serviceKey)))
                .orElseGet(() -> {
                    // Lazy default: treat as multi-specialty until settings are created.
                    return Boolean.TRUE.equals(
                            IpdServicePresets.forPreset(IpdServicePresets.MULTI_SPECIALTY).get(serviceKey));
                });
    }

    @Transactional(readOnly = true)
    public void assertServiceEnabled(UUID hospitalId, UUID tenantId, String serviceKey, String message) {
        if (!isServiceEnabled(hospitalId, tenantId, serviceKey)) {
            throw new BusinessException(ErrorCode.FEATURE_NOT_AVAILABLE, HttpStatus.FORBIDDEN, message);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> resolveCountryConfig(UUID hospitalId, UUID tenantId) {
        return settingsRepository
                .findByHospitalIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId)
                .map(entity -> entity.getCountryConfig() != null && !entity.getCountryConfig().isEmpty()
                        ? entity.getCountryConfig()
                        : IpdServicePresets.defaultIndiaCountryConfig())
                .orElseGet(IpdServicePresets::defaultIndiaCountryConfig);
    }

    private HospitalIpdServiceSettingsEntity requireOrCreate(UserPrincipal principal, UUID hospitalId) {
        return settingsRepository
                .findByHospitalIdAndTenantIdAndDeletedAtIsNull(hospitalId, principal.getTenantId())
                .orElseGet(() -> createDefaults(principal, hospitalId));
    }

    private HospitalIpdServiceSettingsEntity createDefaults(UserPrincipal principal, UUID hospitalId) {
        HospitalEntity hospital = hospitalRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(hospitalId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Hospital not found"));

        String preset = IpdServicePresets.defaultPresetForHospitalType(hospital.getHospitalType());
        HospitalIpdServiceSettingsEntity entity = new HospitalIpdServiceSettingsEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(hospitalId);
        entity.setPresetCode(preset);
        entity.setCountryCode("IN");
        entity.setEnabledServices(IpdServicePresets.forPreset(preset));
        entity.setCountryConfig(IpdServicePresets.defaultIndiaCountryConfig());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        return settingsRepository.save(entity);
    }

    private Map<String, Boolean> normalizeServices(Map<String, Boolean> input) {
        Map<String, Boolean> normalized = IpdServiceKeys.emptyCatalog();
        if (input == null) {
            return normalized;
        }
        for (String key : IpdServiceKeys.ALL) {
            if (input.containsKey(key)) {
                normalized.put(key, Boolean.TRUE.equals(input.get(key)));
            }
        }
        return normalized;
    }

    private HospitalIpdServicesResponse toResponse(UserPrincipal principal, HospitalIpdServiceSettingsEntity entity) {
        Map<String, Boolean> services = normalizeServices(entity.getEnabledServices());
        List<HospitalIpdServicesResponse.ServiceDefinition> catalog = new ArrayList<>();
        for (String key : IpdServiceKeys.ALL) {
            catalog.add(HospitalIpdServicesResponse.ServiceDefinition.builder()
                    .key(key)
                    .label(IpdServiceKeys.LABELS.getOrDefault(key, key))
                    .enabled(Boolean.TRUE.equals(services.get(key)))
                    .build());
        }
        List<HospitalIpdServicesResponse.PresetDefinition> presets = IpdServicePresets.ALL.stream()
                .map(code -> HospitalIpdServicesResponse.PresetDefinition.builder()
                        .code(code)
                        .label(IpdServicePresets.LABELS.getOrDefault(code, code))
                        .build())
                .toList();

        boolean planIpd = featureAccessService.hasFeature(
                entity.getHospitalId(), principal.getTenantId(), PlanFeatureKeys.FEATURE_IPD);
        boolean planIcu = featureAccessService.hasFeature(
                entity.getHospitalId(), principal.getTenantId(), PlanFeatureKeys.FEATURE_ICU);

        return HospitalIpdServicesResponse.builder()
                .hospitalId(entity.getHospitalId())
                .presetCode(entity.getPresetCode())
                .countryCode(entity.getCountryCode())
                .enabledServices(services)
                .countryConfig(entity.getCountryConfig() != null ? entity.getCountryConfig() : Map.of())
                .catalog(catalog)
                .presets(presets)
                .planFeatureIpdEnabled(planIpd)
                .planFeatureIcuEnabled(planIcu)
                .build();
    }
}
