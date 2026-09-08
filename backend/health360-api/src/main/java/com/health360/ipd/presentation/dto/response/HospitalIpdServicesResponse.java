package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class HospitalIpdServicesResponse {
    UUID hospitalId;
    String presetCode;
    String countryCode;
    Map<String, Boolean> enabledServices;
    Map<String, Object> countryConfig;
    List<ServiceDefinition> catalog;
    List<PresetDefinition> presets;
    boolean planFeatureIpdEnabled;
    boolean planFeatureIcuEnabled;

    @Value
    @Builder
    public static class ServiceDefinition {
        String key;
        String label;
        boolean enabled;
    }

    @Value
    @Builder
    public static class PresetDefinition {
        String code;
        String label;
    }
}
