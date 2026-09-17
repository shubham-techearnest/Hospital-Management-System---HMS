package com.health360.procurement.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.procurement.application.service.GoodsReceiptService;
import com.health360.procurement.application.service.PurchaseOrderService;
import com.health360.procurement.application.service.PurchaseRequestService;
import com.health360.procurement.presentation.dto.request.CreatePurchaseOrderPayload;
import com.health360.procurement.presentation.dto.request.CreatePurchaseRequestPayload;
import com.health360.procurement.presentation.dto.request.PostGoodsReceiptPayload;
import com.health360.procurement.presentation.dto.request.ReviewPurchaseRequestPayload;
import com.health360.procurement.presentation.dto.response.GoodsReceiptResponse;
import com.health360.procurement.presentation.dto.response.PurchaseOrderResponse;
import com.health360.procurement.presentation.dto.response.PurchaseRequestResponse;
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
@RequestMapping("/api/v1/procurement")
@RequiredArgsConstructor
public class ProcurementController {

    private final PurchaseRequestService purchaseRequestService;
    private final PurchaseOrderService purchaseOrderService;
    private final GoodsReceiptService goodsReceiptService;

    @PostMapping("/purchase-requests")
    @PreAuthorize("hasAuthority('procurement:write')")
    public ResponseEntity<ApiResponse<PurchaseRequestResponse>> createPurchaseRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePurchaseRequestPayload request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(purchaseRequestService.create(principal, request)));
    }

    @GetMapping("/purchase-requests")
    @PreAuthorize("hasAuthority('procurement:read')")
    public ResponseEntity<ApiResponse<Page<PurchaseRequestResponse>>> listPurchaseRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                purchaseRequestService.list(principal, hospitalId, branchId, status, pageable)));
    }

    @GetMapping("/purchase-requests/{requestId}")
    @PreAuthorize("hasAuthority('procurement:read')")
    public ResponseEntity<ApiResponse<PurchaseRequestResponse>> getPurchaseRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseRequestService.get(principal, requestId)));
    }

    @PostMapping("/purchase-requests/{requestId}/submit")
    @PreAuthorize("hasAuthority('procurement:write')")
    public ResponseEntity<ApiResponse<PurchaseRequestResponse>> submitPurchaseRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseRequestService.submit(principal, requestId)));
    }

    @PostMapping("/purchase-requests/{requestId}/approve")
    @PreAuthorize("hasAuthority('procurement:approve')")
    public ResponseEntity<ApiResponse<PurchaseRequestResponse>> approvePurchaseRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @RequestBody(required = false) ReviewPurchaseRequestPayload request) {
        return ResponseEntity.ok(ApiResponse.ok(
                purchaseRequestService.approve(principal, requestId, request != null ? request : new ReviewPurchaseRequestPayload())));
    }

    @PostMapping("/purchase-requests/{requestId}/reject")
    @PreAuthorize("hasAuthority('procurement:approve')")
    public ResponseEntity<ApiResponse<PurchaseRequestResponse>> rejectPurchaseRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @RequestBody(required = false) ReviewPurchaseRequestPayload request) {
        return ResponseEntity.ok(ApiResponse.ok(
                purchaseRequestService.reject(principal, requestId, request != null ? request : new ReviewPurchaseRequestPayload())));
    }

    @PostMapping("/purchase-orders")
    @PreAuthorize("hasAuthority('procurement:write')")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> createPurchaseOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePurchaseOrderPayload request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(purchaseOrderService.createFromRequest(principal, request)));
    }

    @GetMapping("/purchase-orders")
    @PreAuthorize("hasAuthority('procurement:read')")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderResponse>>> listPurchaseOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                purchaseOrderService.list(principal, hospitalId, branchId, pageable)));
    }

    @GetMapping("/purchase-orders/{orderId}")
    @PreAuthorize("hasAuthority('procurement:read')")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getPurchaseOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.get(principal, orderId)));
    }

    @PostMapping("/goods-receipts")
    @PreAuthorize("hasAuthority('procurement:receive')")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> postGoodsReceipt(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PostGoodsReceiptPayload request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(goodsReceiptService.post(principal, request)));
    }

    @GetMapping("/goods-receipts")
    @PreAuthorize("hasAuthority('procurement:read')")
    public ResponseEntity<ApiResponse<Page<GoodsReceiptResponse>>> listGoodsReceipts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                goodsReceiptService.list(principal, hospitalId, branchId, pageable)));
    }

    @GetMapping("/goods-receipts/{receiptId}")
    @PreAuthorize("hasAuthority('procurement:read')")
    public ResponseEntity<ApiResponse<GoodsReceiptResponse>> getGoodsReceipt(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID receiptId) {
        return ResponseEntity.ok(ApiResponse.ok(goodsReceiptService.get(principal, receiptId)));
    }
}
