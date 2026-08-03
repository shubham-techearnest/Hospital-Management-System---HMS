package com.health360.doctor.presentation.controller;

import com.health360.doctor.application.service.PublicDoctorProfileService;
import com.health360.doctor.presentation.dto.response.PublicDoctorProfileResponse;
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
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class PublicDoctorProfileController {

    private final PublicDoctorProfileService publicDoctorProfileService;
    private final ReviewQueryService reviewQueryService;

    @GetMapping("/{doctorId}/public")
    public ResponseEntity<ApiResponse<PublicDoctorProfileResponse>> getPublicProfile(
            @PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(publicDoctorProfileService.getPublicProfile(doctorId)));
    }

    @GetMapping("/{doctorId}/reviews")
    public ResponseEntity<ApiResponse<PagedReviewResponse>> getReviews(
            @PathVariable UUID doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(reviewQueryService.getDoctorReviews(doctorId, page, size)));
    }
}
