package com.health360.billing.presentation.controller;

import com.health360.billing.application.service.ChargeAttachService;
import com.health360.billing.application.service.ChargeQueryService;
import com.health360.billing.presentation.dto.request.AttachChargesRequest;
import com.health360.billing.presentation.dto.request.ResolveChargeExceptionRequest;
import com.health360.billing.presentation.dto.response.ChargeExceptionResponse;
import com.health360.billing.presentation.dto.response.ChargePostingResponse;
import com.health360.billing.presentation.dto.response.InvoiceResponse;
import com.health360.config.security.UserPrincipal;
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
@RequestMapping("/api/v1/billing/charges")
@RequiredArgsConstructor
public class ChargeController {

    private final ChargeQueryService chargeQueryService;
    private final ChargeAttachService chargeAttachService;

    @GetMapping("/postings")
    @PreAuthorize("hasAuthority('billing:charge:read')")
    public ResponseEntity<ApiResponse<Page<ChargePostingResponse>>> listPostings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                chargeQueryService.listPostings(principal, hospitalId, pageable)));
    }

    @GetMapping("/exceptions")
    @PreAuthorize("hasAnyAuthority('billing:charge:exceptions','billing:charge:read')")
    public ResponseEntity<ApiResponse<Page<ChargeExceptionResponse>>> listExceptions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                chargeQueryService.listExceptions(principal, hospitalId, status, pageable)));
    }

    @PostMapping("/exceptions/{exceptionId}/resolve")
    @PreAuthorize("hasAnyAuthority('billing:charge:exceptions','billing:charge:write')")
    public ResponseEntity<ApiResponse<ChargeExceptionResponse>> resolveException(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID exceptionId,
            @Valid @RequestBody ResolveChargeExceptionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                chargeQueryService.resolveException(principal, exceptionId, request)));
    }

    @PostMapping("/attach")
    @PreAuthorize("hasAnyAuthority('billing:charge:write','billing:invoice:write')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> attach(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AttachChargesRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(chargeAttachService.attachToInvoice(principal, request)));
    }
}
