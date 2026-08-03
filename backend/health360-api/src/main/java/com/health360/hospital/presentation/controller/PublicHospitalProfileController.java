package com.health360.hospital.presentation.controller;

import com.health360.hospital.application.service.PublicHospitalProfileService;
import com.health360.hospital.presentation.dto.response.PagedPublicHospitalDoctorResponse;
import com.health360.hospital.presentation.dto.response.PublicHospitalProfileResponse;
import com.health360.review.application.service.ReviewQueryService;
import com.health360.review.presentation.dto.response.PagedReviewResponse;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class PublicHospitalProfileController {

    private final PublicHospitalProfileService publicHospitalProfileService;
    private final ReviewQueryService reviewQueryService;

    @GetMapping("/{hospitalId}/public")
    public ResponseEntity<ApiResponse<PublicHospitalProfileResponse>> getPublicProfile(
            @PathVariable UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(publicHospitalProfileService.getPublicProfile(hospitalId)));
    }

    @GetMapping("/{hospitalId}/reviews")
    public ResponseEntity<ApiResponse<PagedReviewResponse>> getReviews(
            @PathVariable UUID hospitalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(reviewQueryService.getHospitalReviews(hospitalId, page, size)));
    }

    @GetMapping("/{hospitalId}/doctors")
    public ResponseEntity<ApiResponse<PagedPublicHospitalDoctorResponse>> listDoctors(
            @PathVariable UUID hospitalId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) String specialization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                publicHospitalProfileService.listDoctors(hospitalId, departmentId, specialization, page, size)));
    }
}
