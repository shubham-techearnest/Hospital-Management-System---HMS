package com.health360.subscription.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.shared.dto.ApiResponse;
import com.health360.subscription.application.service.AdminSubscriptionPlanService;
import com.health360.subscription.presentation.dto.request.UpdateSubscriptionPlanRequest;
import com.health360.subscription.presentation.dto.response.SubscriptionPlanResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/plans")
@RequiredArgsConstructor
public class AdminSubscriptionPlanController {

    private final AdminSubscriptionPlanService adminSubscriptionPlanService;

    @GetMapping
    @PreAuthorize("hasAuthority('admin:plans:read')")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> listPlans(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminSubscriptionPlanService.listPlans(principal.getTenantId())));
    }

    @GetMapping("/{planId}")
    @PreAuthorize("hasAuthority('admin:plans:read')")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> getPlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID planId) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminSubscriptionPlanService.getPlan(principal.getTenantId(), planId)));
    }

    @PatchMapping("/{planId}")
    @PreAuthorize("hasAuthority('admin:plans:write')")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> updatePlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID planId,
            @Valid @RequestBody UpdateSubscriptionPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminSubscriptionPlanService.updatePlan(
                        principal.getTenantId(), principal.getUserId(), planId, request)));
    }
}
