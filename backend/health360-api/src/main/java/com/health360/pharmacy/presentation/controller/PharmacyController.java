package com.health360.pharmacy.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.pharmacy.application.service.PharmacyCatalogService;
import com.health360.pharmacy.application.service.PharmacyFulfillmentService;
import com.health360.pharmacy.application.service.PharmacyInventoryService;
import com.health360.pharmacy.application.service.PharmacyRequestService;
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
    private final PharmacyRequestService requestService;
    private final PharmacyInventoryService inventoryService;

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

    // ——— ECO-P4 e-Rx pharmacy share (hospital-first) ———

    @GetMapping("/me/requests")
    @PreAuthorize("hasAuthority('pharmacy:request:read')")
    public ResponseEntity<ApiResponse<List<PharmacyRequestResponse>>> listMyPharmacyRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.listMyRequests(principal)));
    }

    @PostMapping("/me/prescriptions/{prescriptionId}/send-hospital")
    @PreAuthorize("hasAuthority('pharmacy:request:write')")
    public ResponseEntity<ApiResponse<PharmacyRequestResponse>> sendPrescriptionToHospitalPharmacy(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID prescriptionId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                requestService.sendHospital(principal, prescriptionId)));
    }

    @PostMapping("/me/prescriptions/{prescriptionId}/send")
    @PreAuthorize("hasAuthority('pharmacy:request:write')")
    public ResponseEntity<ApiResponse<PharmacyRequestResponse>> sendPrescriptionToPartnerPharmacy(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID prescriptionId,
            @Valid @RequestBody com.health360.org.presentation.dto.request.SendPartnerPharmacyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                requestService.sendPartner(
                        principal, prescriptionId, request.getPartnerOrgId(), request.getLocationId())));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAuthority('pharmacy:request:read')")
    public ResponseEntity<ApiResponse<List<PharmacyRequestResponse>>> listPharmacyRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(
                requestService.listWorklist(principal, hospitalId, branchId, status)));
    }

    @PostMapping("/requests/{requestId}/receive")
    @PreAuthorize("hasAuthority('pharmacy:request:fulfill')")
    public ResponseEntity<ApiResponse<PharmacyRequestResponse>> receivePharmacyRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.receive(principal, requestId)));
    }

    @PostMapping("/requests/{requestId}/review")
    @PreAuthorize("hasAuthority('pharmacy:request:fulfill')")
    public ResponseEntity<ApiResponse<PharmacyRequestResponse>> reviewPharmacyRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @RequestBody(required = false) PharmacyRequestNotesRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.startReview(principal, requestId, request)));
    }

    @PostMapping("/requests/{requestId}/ready")
    @PreAuthorize("hasAuthority('pharmacy:request:fulfill')")
    public ResponseEntity<ApiResponse<PharmacyRequestResponse>> markPharmacyRequestReady(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @RequestBody(required = false) PharmacyRequestNotesRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.markReady(principal, requestId, request)));
    }

    @PostMapping("/requests/{requestId}/dispense")
    @PreAuthorize("hasAuthority('pharmacy:request:fulfill')")
    public ResponseEntity<ApiResponse<PharmacyRequestResponse>> dispensePharmacyRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.dispense(principal, requestId)));
    }

    @PostMapping("/stock/receive")
    @PreAuthorize("hasAnyAuthority('pharmacy:stock:write', 'pharmacy:medicine:write')")
    public ResponseEntity<ApiResponse<MedicineBatchResponse>> receiveStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReceiveStockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok(inventoryService.receiveStock(principal, request)));
    }

    @GetMapping("/stock/medicines/{medicineId}")
    @PreAuthorize("hasAnyAuthority('pharmacy:stock:read', 'pharmacy:medicine:read')")
    public ResponseEntity<ApiResponse<MedicineStockSummaryResponse>> getMedicineStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID medicineId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getStock(principal, medicineId)));
    }
}
