package com.health360.org.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.org.application.service.PartnerNearbySearchService;
import com.health360.org.presentation.dto.response.NearbyPartnerResponse;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/partners")
@RequiredArgsConstructor
public class PartnerController {

    private final PartnerNearbySearchService nearbySearchService;

    @GetMapping("/nearby")
    @PreAuthorize("hasAuthority('partner:nearby:read') or hasAuthority('partner:org:read')")
    public ResponseEntity<ApiResponse<List<NearbyPartnerResponse>>> nearby(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String type,
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) Double radiusKm,
            @RequestParam(required = false) UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(
                nearbySearchService.findNearby(principal, type, lat, lng, radiusKm, hospitalId)));
    }
}
