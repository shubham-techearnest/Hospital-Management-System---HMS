package com.health360.pharmacy.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.pharmacy.application.service.PharmacyCatalogService;
import com.health360.pharmacy.application.service.PharmacyFulfillmentService;
import com.health360.pharmacy.presentation.dto.request.*;
import com.health360.pharmacy.presentation.dto.response.*;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyCatalogService catalogService;
    private final PharmacyFulfillmentService fulfillmentService;

    @PostMapping("/medicines")
    @PreAuthorize("hasAuthority('pharmacy:medicine:write')")
    public ResponseEntity<ApiResponse<MedicineResponse>> createMedicine(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateMedicineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                catalogService.createMedicine(principal, request)));
    }

    @GetMapping("/medicines")
    @PreAuthorize("hasAuthority('pharmacy:medicine:read')")
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> listMedicines(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.listMedicines(principal, hospitalId, branchId)));
    }

    @GetMapping("/worklist/pending")
    @PreAuthorize("hasAuthority('pharmacy:medication:read')")
    public ResponseEntity<ApiResponse<List<MedicationWorklistItemResponse>>> listPendingWorklist(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.listPendingWorklist(principal, hospitalId, branchId)));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAuthority('pharmacy:medication:write')")
    public ResponseEntity<ApiResponse<MedicationOrderResponse>> createMedicationOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateMedicationOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                fulfillmentService.createMedicationOrder(principal, request)));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('pharmacy:medication:read')")
    public ResponseEntity<ApiResponse<Page<MedicationOrderResponse>>> listMedicationOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.listMedicationOrders(principal, hospitalId, branchId, status, pageable)));
    }

    @GetMapping("/orders/{medicationOrderId}")
    @PreAuthorize("hasAuthority('pharmacy:medication:read')")
    public ResponseEntity<ApiResponse<MedicationOrderResponse>> getMedicationOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID medicationOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.getMedicationOrder(principal, medicationOrderId)));
    }

    @PostMapping("/orders/{medicationOrderId}/verify")
    @PreAuthorize("hasAuthority('pharmacy:medication:write')")
    public ResponseEntity<ApiResponse<MedicationOrderResponse>> verifyMedicationOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID medicationOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.verifyMedicationOrder(principal, medicationOrderId)));
    }

    @PostMapping("/order-items/{orderItemId}/plan")
    @PreAuthorize("hasAuthority('pharmacy:medication:write')")
    public ResponseEntity<ApiResponse<MedicationOrderResponse>> planOrderItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID orderItemId,
            @Valid @RequestBody PlanMedicationOrderItemRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.planOrderItem(principal, orderItemId, request)));
    }

    @PostMapping("/order-items/{orderItemId}/administer")
    @PreAuthorize("hasAuthority('pharmacy:medication:administer')")
    public ResponseEntity<ApiResponse<MedicationAdministrationResponse>> administerMedication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID orderItemId,
            @Valid @RequestBody AdministerMedicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                fulfillmentService.administerMedication(principal, orderItemId, request)));
    }

    @PostMapping("/order-items/{orderItemId}/complete")
    @PreAuthorize("hasAuthority('pharmacy:medication:write')")
    public ResponseEntity<ApiResponse<MedicationOrderResponse>> completeOrderItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID orderItemId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.completeOrderItem(principal, orderItemId)));
    }

    @GetMapping("/encounters/{encounterId}/administrations")
    @PreAuthorize("hasAnyAuthority('pharmacy:medication:read', 'clinical:encounter:read', 'clinical:encounter:write')")
    public ResponseEntity<ApiResponse<List<MedicationAdministrationResponse>>> listEncounterAdministrations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.listEncounterAdministrations(principal, encounterId)));
    }
}
