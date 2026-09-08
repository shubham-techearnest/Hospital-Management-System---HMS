package com.health360.ipd.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalService;
import com.health360.ipd.application.service.IpdServiceCatalogService;
import com.health360.ipd.presentation.dto.request.ApplyIpdServicePresetRequest;
import com.health360.ipd.presentation.dto.request.UpdateHospitalIpdServicesRequest;
import com.health360.ipd.presentation.dto.response.HospitalIpdServicesResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/hospitals/me/ipd-services")
@RequiredArgsConstructor
public class HospitalIpdServicesController {

    private final HospitalService hospitalService;
    private final IpdServiceCatalogService ipdServiceCatalogService;

    @GetMapping
    @PreAuthorize("hasAuthority('ipd:settings:read') or hasAuthority('ipd:admin') or hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<HospitalIpdServicesResponse>> getMyIpdServices(
            @AuthenticationPrincipal UserPrincipal principal) {
        var profile = hospitalService.getProfile(principal.getUserId(), principal.getTenantId());
        return ResponseEntity.ok(ApiResponse.ok(
                ipdServiceCatalogService.getSettings(principal, profile.getId())));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ipd:settings:write') or hasAuthority('ipd:admin')")
    public ResponseEntity<ApiResponse<HospitalIpdServicesResponse>> updateMyIpdServices(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateHospitalIpdServicesRequest request) {
        var profile = hospitalService.getProfile(principal.getUserId(), principal.getTenantId());
        return ResponseEntity.ok(ApiResponse.ok(
                ipdServiceCatalogService.updateSettings(principal, profile.getId(), request)));
    }

    @PostMapping("/apply-preset")
    @PreAuthorize("hasAuthority('ipd:settings:write') or hasAuthority('ipd:admin')")
    public ResponseEntity<ApiResponse<HospitalIpdServicesResponse>> applyPreset(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplyIpdServicePresetRequest request) {
        var profile = hospitalService.getProfile(principal.getUserId(), principal.getTenantId());
        return ResponseEntity.ok(ApiResponse.ok(
                ipdServiceCatalogService.applyPreset(principal, profile.getId(), request)));
    }
}
