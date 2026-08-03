package com.health360.location.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.location.application.service.GeocodeService;
import com.health360.location.application.service.NearbyLocationService;
import com.health360.location.application.service.TravelTimeService;
import com.health360.location.presentation.dto.request.GeocodeRequest;
import com.health360.location.presentation.dto.response.DistanceResponse;
import com.health360.location.presentation.dto.response.GeocodeResponse;
import com.health360.location.presentation.dto.response.PagedNearbyHospitalResponse;
import com.health360.search.presentation.dto.response.PagedDoctorSearchResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/location")
@RequiredArgsConstructor
public class LocationController {

    private final GeocodeService geocodeService;
    private final NearbyLocationService nearbyLocationService;
    private final TravelTimeService travelTimeService;

    @PostMapping("/geocode")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<GeocodeResponse>> geocode(
            @Valid @RequestBody GeocodeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(geocodeService.geocode(request.getAddress())));
    }

    @GetMapping("/distance")
    @PreAuthorize("hasAuthority('location:read')")
    public ResponseEntity<ApiResponse<DistanceResponse>> getDistance(
            @RequestParam double originLat,
            @RequestParam double originLng,
            @RequestParam double destLat,
            @RequestParam double destLng) {
        return ResponseEntity.ok(ApiResponse.ok(
                travelTimeService.calculateDistance(originLat, originLng, destLat, destLng)));
    }

    @GetMapping("/nearby/hospitals")
    @PreAuthorize("hasAuthority('location:read')")
    public ResponseEntity<ApiResponse<PagedNearbyHospitalResponse>> nearbyHospitals(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5") double radiusKm,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Boolean emergency24x7,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                nearbyLocationService.nearbyHospitals(
                        principal.getTenantId(), latitude, longitude, radiusKm,
                        department, emergency24x7, minRating, page, size)));
    }

    @GetMapping("/nearby/doctors")
    @PreAuthorize("hasAuthority('location:read')")
    public ResponseEntity<ApiResponse<PagedDoctorSearchResponse>> nearbyDoctors(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5") double radiusKm,
            @RequestParam(required = false) String specialization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                nearbyLocationService.nearbyDoctors(
                        principal.getTenantId(), latitude, longitude, radiusKm,
                        specialization, page, size)));
    }
}
