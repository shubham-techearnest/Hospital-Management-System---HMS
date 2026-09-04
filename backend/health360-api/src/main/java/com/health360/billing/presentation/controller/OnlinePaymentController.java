package com.health360.billing.presentation.controller;

import com.health360.billing.application.service.OnlinePaymentService;
import com.health360.billing.application.service.SaasBillingService;
import com.health360.billing.presentation.dto.request.ConfirmSandboxPaymentRequest;
import com.health360.billing.presentation.dto.request.CreatePaymentIntentRequest;
import com.health360.billing.presentation.dto.response.PaymentIntentResponse;
import com.health360.billing.presentation.dto.response.PaymentResponse;
import com.health360.billing.presentation.dto.response.SaasPaymentIntentResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class OnlinePaymentController {

    private final OnlinePaymentService onlinePaymentService;
    private final SaasBillingService saasBillingService;

    @PostMapping("/invoices/{invoiceId}/payment-intents")
    @PreAuthorize("hasAuthority('billing:invoice:read')")
    public ResponseEntity<ApiResponse<PaymentIntentResponse>> createPaymentIntent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID invoiceId,
            @Valid @RequestBody(required = false) CreatePaymentIntentRequest request) {
        CreatePaymentIntentRequest body = request != null ? request : new CreatePaymentIntentRequest();
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok(onlinePaymentService.createInvoicePaymentIntent(principal, invoiceId, body)));
    }

    @PostMapping("/payments/{paymentId}/confirm-sandbox")
    @PreAuthorize("hasAuthority('billing:invoice:read')")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmSandbox(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID paymentId,
            @Valid @RequestBody(required = false) ConfirmSandboxPaymentRequest request) {
        ConfirmSandboxPaymentRequest body = request != null ? request : new ConfirmSandboxPaymentRequest();
        return ResponseEntity.ok(ApiResponse.ok(
                onlinePaymentService.confirmSandboxPayment(principal, paymentId, body)));
    }

    @PostMapping("/payments/webhook")
    public ResponseEntity<Map<String, String>> webhook(HttpServletRequest request) throws Exception {
        String rawBody = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
        String signature = request.getHeader("X-Razorpay-Signature");
        onlinePaymentService.handleWebhook(rawBody, signature);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/saas/payment-intents")
    @PreAuthorize("hasAuthority('hospital:subscription:read')")
    public ResponseEntity<ApiResponse<SaasPaymentIntentResponse>> createHospitalSaasIntent(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok(saasBillingService.createRenewalIntentForHospitalAdmin(principal)));
    }

    @PostMapping("/saas/{saasInvoiceId}/confirm-sandbox")
    @PreAuthorize("hasAuthority('hospital:subscription:read')")
    public ResponseEntity<ApiResponse<SaasPaymentIntentResponse>> confirmHospitalSaasSandbox(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID saasInvoiceId) {
        return ResponseEntity.ok(ApiResponse.ok(
                saasBillingService.confirmSandboxForHospitalAdmin(principal, saasInvoiceId)));
    }
}
