package com.health360.search.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.search.application.service.DoctorSearchService;
import com.health360.search.presentation.dto.request.DoctorSearchRequest;
import com.health360.search.presentation.dto.response.PagedDoctorSearchResponse;
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

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class DoctorSearchController {

    private final DoctorSearchService doctorSearchService;

    @GetMapping("/doctors")
    @PreAuthorize("hasAuthority('search:read')")
    public ResponseEntity<ApiResponse<PagedDoctorSearchResponse>> searchDoctors(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String hospital,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Boolean availableToday,
            @RequestParam(required = false) String consultationMode,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double maxDistance,
            @RequestParam(defaultValue = "RELEVANCE") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        DoctorSearchRequest request = new DoctorSearchRequest();
        request.setQ(q);
        request.setSpecialization(specialization);
        request.setHospital(hospital);
        request.setCity(city);
        request.setDepartment(department);
        request.setMinExperience(minExperience);
        request.setLanguage(language);
        request.setGender(gender);
        request.setAvailableToday(availableToday);
        request.setConsultationMode(consultationMode);
        request.setMinRating(minRating);
        request.setMaxFee(maxFee);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setMaxDistance(maxDistance);
        request.setSort(sort);
        request.setPage(page);
        request.setSize(size);

        return ResponseEntity.ok(ApiResponse.ok(
                doctorSearchService.search(principal.getTenantId(), request)));
    }
}
