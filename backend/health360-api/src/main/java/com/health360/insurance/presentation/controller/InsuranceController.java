package com.health360.insurance.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.insurance.application.service.InsuranceService;
import com.health360.insurance.presentation.dto.request.CreateInsuranceClaimRequest;
import com.health360.insurance.presentation.dto.request.CreateInsurancePayerRequest;
import com.health360.insurance.presentation.dto.request.CreateInsurancePolicyRequest;
import com.health360.insurance.presentation.dto.request.CreatePreAuthorizationRequest;
import com.health360.insurance.presentation.dto.request.DecideInsuranceClaimRequest;
import com.health360.insurance.presentation.dto.request.DecidePreAuthorizationRequest;
import com.health360.insurance.presentation.dto.response.InsuranceClaimResponse;
import com.health360.insurance.presentation.dto.response.InsurancePayerResponse;
import com.health360.insurance.presentation.dto.response.InsurancePolicyResponse;
import com.health360.insurance.presentation.dto.response.PreAuthorizationResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/insurance")
@RequiredArgsConstructor
public class InsuranceController {

    private final InsuranceService insuranceService;

    @PostMapping("/payers")
    @PreAuthorize("hasAuthority('insurance:write')")
    public ResponseEntity<ApiResponse<InsurancePayerResponse>> createPayer(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateInsurancePayerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(insuranceService.createPayer(principal, request)));
    }

    @GetMapping("/payers")
    @PreAuthorize("hasAuthority('insurance:read')")
    public ResponseEntity<ApiResponse<List<InsurancePayerResponse>>> listPayers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.listPayers(principal, hospitalId)));
    }

    @PostMapping("/policies")
    @PreAuthorize("hasAuthority('insurance:write')")
    public ResponseEntity<ApiResponse<InsurancePolicyResponse>> createPolicy(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateInsurancePolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(insuranceService.createPolicy(principal, request)));
    }

    @GetMapping("/policies")
    @PreAuthorize("hasAuthority('insurance:read')")
    public ResponseEntity<ApiResponse<Page<InsurancePolicyResponse>>> listPolicies(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) UUID patientId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                insuranceService.listPolicies(principal, hospitalId, branchId, patientId, pageable)));
    }

    @PostMapping("/pre-authorizations")
    @PreAuthorize("hasAuthority('insurance:write')")
    public ResponseEntity<ApiResponse<PreAuthorizationResponse>> requestPreAuth(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePreAuthorizationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(insuranceService.requestPreAuth(principal, request)));
    }

    @GetMapping("/pre-authorizations")
    @PreAuthorize("hasAuthority('insurance:read')")
    public ResponseEntity<ApiResponse<Page<PreAuthorizationResponse>>> listPreAuths(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                insuranceService.listPreAuths(principal, hospitalId, branchId, status, pageable)));
    }

    @PostMapping("/pre-authorizations/{authId}/decide")
    @PreAuthorize("hasAuthority('insurance:approve')")
    public ResponseEntity<ApiResponse<PreAuthorizationResponse>> decidePreAuth(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID authId,
            @Valid @RequestBody DecidePreAuthorizationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.decidePreAuth(principal, authId, request)));
    }

    @PostMapping("/claims")
    @PreAuthorize("hasAuthority('insurance:write')")
    public ResponseEntity<ApiResponse<InsuranceClaimResponse>> createClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateInsuranceClaimRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(insuranceService.createClaim(principal, request)));
    }

    @GetMapping("/claims")
    @PreAuthorize("hasAuthority('insurance:read')")
    public ResponseEntity<ApiResponse<Page<InsuranceClaimResponse>>> listClaims(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                insuranceService.listClaims(principal, hospitalId, branchId, status, pageable)));
    }

    @PostMapping("/claims/{claimId}/submit")
    @PreAuthorize("hasAuthority('insurance:write')")
    public ResponseEntity<ApiResponse<InsuranceClaimResponse>> submitClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID claimId) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.submitClaim(principal, claimId)));
    }

    @PostMapping("/claims/{claimId}/decide")
    @PreAuthorize("hasAuthority('insurance:approve')")
    public ResponseEntity<ApiResponse<InsuranceClaimResponse>> decideClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID claimId,
            @Valid @RequestBody DecideInsuranceClaimRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.decideClaim(principal, claimId, request)));
    }
}
