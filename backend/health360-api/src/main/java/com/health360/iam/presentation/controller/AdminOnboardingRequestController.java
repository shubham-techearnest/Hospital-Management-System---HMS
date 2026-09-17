package com.health360.iam.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.application.service.OnboardingRequestService;
import com.health360.iam.presentation.dto.request.UpdateOnboardingRequestStatusRequest;
import com.health360.iam.presentation.dto.response.OnboardingRequestResponse;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/onboarding-requests")
@RequiredArgsConstructor
public class AdminOnboardingRequestController {

    private final OnboardingRequestService onboardingRequestService;

    @GetMapping
    @PreAuthorize("hasAuthority('admin:hospitals:read')")
    public ResponseEntity<ApiResponse<Page<OnboardingRequestResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String requestType,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                onboardingRequestService.list(principal.getTenantId(), status, requestType, pageable)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('admin:hospitals:write')")
    public ResponseEntity<ApiResponse<OnboardingRequestResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOnboardingRequestStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                onboardingRequestService.updateStatus(
                        principal.getTenantId(), principal.getUserId(), id, request)));
    }
}
