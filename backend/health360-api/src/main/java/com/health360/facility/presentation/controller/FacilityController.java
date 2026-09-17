package com.health360.facility.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.facility.application.service.FacilityWorkOrderService;
import com.health360.facility.presentation.dto.request.CompleteFacilityWorkOrderRequest;
import com.health360.facility.presentation.dto.request.CreateFacilityWorkOrderRequest;
import com.health360.facility.presentation.dto.response.FacilityWorkOrderResponse;
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
@RequestMapping("/api/v1/facility")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityWorkOrderService workOrderService;

    @PostMapping("/work-orders")
    @PreAuthorize("hasAuthority('facility:write')")
    public ResponseEntity<ApiResponse<FacilityWorkOrderResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateFacilityWorkOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(workOrderService.create(principal, request)));
    }

    @GetMapping("/work-orders")
    @PreAuthorize("hasAuthority('facility:read')")
    public ResponseEntity<ApiResponse<Page<FacilityWorkOrderResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String workType,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                workOrderService.list(principal, hospitalId, branchId, workType, status, pageable)));
    }

    @GetMapping("/work-orders/{workOrderId}")
    @PreAuthorize("hasAuthority('facility:read')")
    public ResponseEntity<ApiResponse<FacilityWorkOrderResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(workOrderService.get(principal, workOrderId)));
    }

    @PostMapping("/work-orders/{workOrderId}/start")
    @PreAuthorize("hasAuthority('facility:complete') or hasAuthority('facility:write')")
    public ResponseEntity<ApiResponse<FacilityWorkOrderResponse>> start(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(workOrderService.start(principal, workOrderId)));
    }

    @PostMapping("/work-orders/{workOrderId}/complete")
    @PreAuthorize("hasAuthority('facility:complete') or hasAuthority('facility:write')")
    public ResponseEntity<ApiResponse<FacilityWorkOrderResponse>> complete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID workOrderId,
            @RequestBody(required = false) CompleteFacilityWorkOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(workOrderService.complete(
                principal, workOrderId, request != null ? request : new CompleteFacilityWorkOrderRequest())));
    }
}
