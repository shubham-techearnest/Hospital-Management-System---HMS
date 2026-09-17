package com.health360.inventory.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.inventory.application.service.InventoryCatalogService;
import com.health360.inventory.application.service.InventoryStockService;
import com.health360.inventory.presentation.dto.request.AdjustInventoryStockRequest;
import com.health360.inventory.presentation.dto.request.CreateInventoryItemRequest;
import com.health360.inventory.presentation.dto.request.ReceiveInventoryStockRequest;
import com.health360.inventory.presentation.dto.response.InventoryItemResponse;
import com.health360.inventory.presentation.dto.response.InventoryLocationResponse;
import com.health360.inventory.presentation.dto.response.StockBalanceResponse;
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
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryCatalogService catalogService;
    private final InventoryStockService stockService;

    @PostMapping("/items")
    @PreAuthorize("hasAuthority('inventory:write')")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> createItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateInventoryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(catalogService.createItem(principal, request)));
    }

    @GetMapping("/items")
    @PreAuthorize("hasAuthority('inventory:read')")
    public ResponseEntity<ApiResponse<Page<InventoryItemResponse>>> listItems(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.listItems(principal, hospitalId, branchId, category, pageable)));
    }

    @GetMapping("/items/{itemId}")
    @PreAuthorize("hasAuthority('inventory:read')")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> getItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getItem(principal, itemId)));
    }

    @GetMapping("/locations")
    @PreAuthorize("hasAuthority('inventory:read')")
    public ResponseEntity<ApiResponse<List<InventoryLocationResponse>>> listLocations(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.listLocations(principal, hospitalId, branchId)));
    }

    @PostMapping("/stock/receive")
    @PreAuthorize("hasAuthority('inventory:stock:write')")
    public ResponseEntity<ApiResponse<StockBalanceResponse>> receive(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReceiveInventoryStockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(stockService.receive(principal, request)));
    }

    @PostMapping("/stock/adjust")
    @PreAuthorize("hasAuthority('inventory:stock:write')")
    public ResponseEntity<ApiResponse<StockBalanceResponse>> adjust(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AdjustInventoryStockRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(stockService.adjust(principal, request)));
    }

    @GetMapping("/stock/balances")
    @PreAuthorize("hasAuthority('inventory:stock:read')")
    public ResponseEntity<ApiResponse<Page<StockBalanceResponse>>> listBalances(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(defaultValue = "false") boolean lowStockOnly,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                stockService.listBalances(principal, hospitalId, branchId, locationId, lowStockOnly, pageable)));
    }
}
