package com.health360.review.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.review.application.service.ReviewCommandService;
import com.health360.review.presentation.dto.request.SubmitReviewRequest;
import com.health360.review.presentation.dto.response.SubmitReviewResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewCommandService reviewCommandService;

    @PostMapping("/doctors")
    @PreAuthorize("hasAuthority('review:create')")
    public ResponseEntity<ApiResponse<SubmitReviewResponse>> submitDoctorReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SubmitReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                reviewCommandService.submitDoctorReview(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PostMapping("/hospitals")
    @PreAuthorize("hasAuthority('review:create')")
    public ResponseEntity<ApiResponse<SubmitReviewResponse>> submitHospitalReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SubmitReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                reviewCommandService.submitHospitalReview(
                        principal.getUserId(), principal.getTenantId(), request)));
    }
}
