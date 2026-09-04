package com.health360.subscription.presentation.controller;

import com.health360.billing.application.service.SaasBillingService;
import com.health360.billing.presentation.dto.response.SaasPaymentIntentResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.dto.ApiResponse;
import com.health360.subscription.application.service.AdminHospitalSubscriptionService;
import com.health360.subscription.presentation.dto.request.ChangeHospitalPlanRequest;
import com.health360.subscription.presentation.dto.response.HospitalSubscriptionResponse;
import com.health360.subscription.presentation.dto.response.SubscriptionHistoryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/hospitals/{hospitalId}/subscription")
@RequiredArgsConstructor
public class AdminHospitalSubscriptionController {

    private final AdminHospitalSubscriptionService adminHospitalSubscriptionService;
    private final SaasBillingService saasBillingService;

    @GetMapping
    @PreAuthorize("hasAuthority('admin:subscriptions:read')")
    public ResponseEntity<ApiResponse<HospitalSubscriptionResponse>> getSubscription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminHospitalSubscriptionService.getSubscription(principal.getTenantId(), hospitalId)));
    }

    @PutMapping("/plan")
    @PreAuthorize("hasAuthority('admin:subscriptions:write')")
    public ResponseEntity<ApiResponse<HospitalSubscriptionResponse>> changePlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID hospitalId,
            @Valid @RequestBody ChangeHospitalPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminHospitalSubscriptionService.changePlan(
                        principal.getTenantId(), principal.getUserId(), hospitalId, request)));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAuthority('admin:subscriptions:read')")
    public ResponseEntity<ApiResponse<List<SubscriptionHistoryResponse>>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminHospitalSubscriptionService.getHistory(principal.getTenantId(), hospitalId)));
    }

    @PostMapping("/payment-intents")
    @PreAuthorize("hasAuthority('admin:subscriptions:write')")
    public ResponseEntity<ApiResponse<SaasPaymentIntentResponse>> createPaymentIntent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID hospitalId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok(saasBillingService.createRenewalIntentForAdmin(principal, hospitalId)));
    }

    @PostMapping("/saas-invoices/{saasInvoiceId}/confirm-sandbox")
    @PreAuthorize("hasAuthority('admin:subscriptions:write')")
    public ResponseEntity<ApiResponse<SaasPaymentIntentResponse>> confirmSandbox(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID hospitalId,
            @PathVariable UUID saasInvoiceId) {
        return ResponseEntity.ok(ApiResponse.ok(
                saasBillingService.confirmSandboxForPlatformAdmin(principal, saasInvoiceId)));
    }
}
