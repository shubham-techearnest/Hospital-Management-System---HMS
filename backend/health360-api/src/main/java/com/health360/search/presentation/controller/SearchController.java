package com.health360.search.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.search.application.service.HospitalSearchService;
import com.health360.search.application.service.SpecializationTaxonomyService;
import com.health360.search.application.service.UnifiedSearchService;
import com.health360.search.presentation.dto.request.HospitalSearchRequest;
import com.health360.search.presentation.dto.response.PagedHospitalSearchResponse;
import com.health360.search.presentation.dto.response.SpecializationOptionResponse;
import com.health360.search.presentation.dto.response.UnifiedSearchResponse;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final UnifiedSearchService unifiedSearchService;
    private final HospitalSearchService hospitalSearchService;
    private final SpecializationTaxonomyService specializationTaxonomyService;

    @GetMapping
    @PreAuthorize("hasAuthority('search:read')")
    public ResponseEntity<ApiResponse<UnifiedSearchResponse>> unifiedSearch(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "ALL") String type,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double maxDistance,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                unifiedSearchService.search(
                        principal.getTenantId(), q, type, latitude, longitude, maxDistance, page, size)));
    }

    @GetMapping("/hospitals")
    @PreAuthorize("hasAuthority('search:read')")
    public ResponseEntity<ApiResponse<PagedHospitalSearchResponse>> searchHospitals(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String facility,
            @RequestParam(required = false) Boolean emergency24x7,
            @RequestParam(required = false) Boolean icuAvailable,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double maxDistance,
            @RequestParam(defaultValue = "RELEVANCE") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        HospitalSearchRequest request = new HospitalSearchRequest();
        request.setQ(q);
        request.setDepartment(department);
        request.setFacility(facility);
        request.setEmergency24x7(emergency24x7);
        request.setIcuAvailable(icuAvailable);
        request.setMinRating(minRating);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setMaxDistance(maxDistance);
        request.setSort(sort);
        request.setPage(page);
        request.setSize(size);
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalSearchService.search(principal.getTenantId(), request)));
    }

    @GetMapping("/specializations")
    @PreAuthorize("hasAuthority('search:read')")
    public ResponseEntity<ApiResponse<List<SpecializationOptionResponse>>> listSpecializations() {
        return ResponseEntity.ok(ApiResponse.ok(specializationTaxonomyService.listActiveSpecializations()));
    }
}
