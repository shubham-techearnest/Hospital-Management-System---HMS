package com.health360.billing.presentation.controller;

import com.health360.billing.application.service.BillingService;
import com.health360.billing.presentation.dto.request.CreateInvoiceRequest;
import com.health360.billing.presentation.dto.request.RecordPaymentRequest;
import com.health360.billing.presentation.dto.response.InvoiceResponse;
import com.health360.billing.presentation.dto.response.PaymentResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/invoices")
    @PreAuthorize("hasAuthority('billing:invoice:write')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok(billingService.createInvoice(principal, request)));
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasAuthority('billing:invoice:read')")
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> listHospitalInvoices(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                billingService.listHospitalInvoices(principal, hospitalId, branchId, pageable)));
    }

    @GetMapping("/invoices/me")
    @PreAuthorize("hasAuthority('billing:invoice:read')")
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> listMyInvoices(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                billingService.listMyInvoices(principal, pageable)));
    }

    @GetMapping("/invoices/{invoiceId}")
    @PreAuthorize("hasAuthority('billing:invoice:read')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID invoiceId) {
        return ResponseEntity.ok(ApiResponse.ok(
                billingService.getInvoice(principal, invoiceId)));
    }

    @PostMapping("/invoices/{invoiceId}/payments")
    @PreAuthorize("hasAuthority('billing:payment:write')")
    public ResponseEntity<ApiResponse<PaymentResponse>> recordPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID invoiceId,
            @Valid @RequestBody RecordPaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok(billingService.recordPayment(principal, invoiceId, request)));
    }
}
