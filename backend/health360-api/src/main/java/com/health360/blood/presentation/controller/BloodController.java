package com.health360.blood.presentation.controller;

import com.health360.blood.application.service.BloodBankService;
import com.health360.blood.presentation.dto.request.CompleteBloodRequestRequest;
import com.health360.blood.presentation.dto.request.CreateBloodRequestRequest;
import com.health360.blood.presentation.dto.request.DecideBloodRequestRequest;
import com.health360.blood.presentation.dto.request.IssueBloodRequestRequest;
import com.health360.blood.presentation.dto.request.ReceiveBloodUnitRequest;
import com.health360.blood.presentation.dto.response.BloodRequestResponse;
import com.health360.blood.presentation.dto.response.BloodUnitResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/blood")
@RequiredArgsConstructor
public class BloodController {

    private final BloodBankService bloodBankService;

    @PostMapping("/units")
    @PreAuthorize("hasAuthority('blood:write')")
    public ResponseEntity<ApiResponse<BloodUnitResponse>> receiveUnit(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReceiveBloodUnitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(bloodBankService.receiveUnit(principal, request)));
    }

    @GetMapping("/units")
    @PreAuthorize("hasAuthority('blood:read')")
    public ResponseEntity<ApiResponse<Page<BloodUnitResponse>>> listUnits(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                bloodBankService.listUnits(principal, hospitalId, branchId, status, pageable)));
    }

    @PostMapping("/requests")
    @PreAuthorize("hasAuthority('blood:write')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> createRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateBloodRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(bloodBankService.createRequest(principal, request)));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAuthority('blood:read')")
    public ResponseEntity<ApiResponse<Page<BloodRequestResponse>>> listRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                bloodBankService.listRequests(principal, hospitalId, branchId, status, pageable)));
    }

    @PostMapping("/requests/{requestId}/decide")
    @PreAuthorize("hasAuthority('blood:issue')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> decide(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @Valid @RequestBody DecideBloodRequestRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bloodBankService.decideRequest(principal, requestId, request)));
    }

    @PostMapping("/requests/{requestId}/issue")
    @PreAuthorize("hasAuthority('blood:issue')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> issue(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @RequestBody(required = false) IssueBloodRequestRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bloodBankService.issueRequest(
                principal, requestId, request != null ? request : new IssueBloodRequestRequest())));
    }

    @PostMapping("/requests/{requestId}/return")
    @PreAuthorize("hasAuthority('blood:issue')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> returnIssued(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @RequestBody(required = false) CompleteBloodRequestRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bloodBankService.returnIssued(
                principal, requestId, request != null ? request : new CompleteBloodRequestRequest())));
    }

    @PostMapping("/requests/{requestId}/complete")
    @PreAuthorize("hasAuthority('blood:issue')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> complete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @RequestBody(required = false) CompleteBloodRequestRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bloodBankService.completeRequest(
                principal, requestId, request != null ? request : new CompleteBloodRequestRequest())));
    }
}
