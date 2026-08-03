package com.health360.review.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.review.application.service.AdminReviewModerationService;
import com.health360.review.presentation.dto.request.ModerateReviewRequest;
import com.health360.review.presentation.dto.response.AdminReviewResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewModerationService adminReviewModerationService;

    @GetMapping
    @PreAuthorize("hasAuthority('admin:review:moderate')")
    public ResponseEntity<ApiResponse<Page<AdminReviewResponse>>> listReviews(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "visible") String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminReviewModerationService.listReviews(principal.getTenantId(), status, pageable)));
    }

    @PostMapping("/{reviewId}/moderate")
    @PreAuthorize("hasAuthority('admin:review:moderate')")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> moderateReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID reviewId,
            @Valid @RequestBody ModerateReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminReviewModerationService.moderateReview(
                        principal.getTenantId(), principal.getUserId(), reviewId, request)));
    }
}
