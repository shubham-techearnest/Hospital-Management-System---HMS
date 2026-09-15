package com.health360.asset.presentation.controller;

import com.health360.asset.application.service.AssetService;
import com.health360.asset.presentation.dto.request.CreateAssetMaintenanceRequest;
import com.health360.asset.presentation.dto.request.CreateAssetRequest;
import com.health360.asset.presentation.dto.request.UpdateAssetRequest;
import com.health360.asset.presentation.dto.request.UpdateAssetStatusRequest;
import com.health360.asset.presentation.dto.response.AssetCategoryResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceResponse;
import com.health360.asset.presentation.dto.response.AssetResponse;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping("/categories")
    @PreAuthorize("hasAuthority('asset:read')")
    public ResponseEntity<ApiResponse<List<AssetCategoryResponse>>> listCategories(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(assetService.listCategories(principal)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('asset:write')")
    public ResponseEntity<ApiResponse<AssetResponse>> createAsset(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAssetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(assetService.createAsset(principal, request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('asset:read')")
    public ResponseEntity<ApiResponse<Page<AssetResponse>>> listAssets(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                assetService.listAssets(principal, hospitalId, branchId, status, categoryId, q, pageable)));
    }

    @GetMapping("/{assetId}")
    @PreAuthorize("hasAuthority('asset:read')")
    public ResponseEntity<ApiResponse<AssetResponse>> getAsset(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId) {
        return ResponseEntity.ok(ApiResponse.ok(assetService.getAsset(principal, assetId)));
    }

    @PatchMapping("/{assetId}")
    @PreAuthorize("hasAuthority('asset:write')")
    public ResponseEntity<ApiResponse<AssetResponse>> updateAsset(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId,
            @Valid @RequestBody UpdateAssetRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(assetService.updateAsset(principal, assetId, request)));
    }

    @PostMapping("/{assetId}/status")
    @PreAuthorize("hasAuthority('asset:write')")
    public ResponseEntity<ApiResponse<AssetResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId,
            @Valid @RequestBody UpdateAssetStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(assetService.updateStatus(principal, assetId, request)));
    }

    @PostMapping("/{assetId}/maintenance")
    @PreAuthorize("hasAuthority('asset:maintenance:write') or hasAuthority('asset:write')")
    public ResponseEntity<ApiResponse<AssetMaintenanceResponse>> addMaintenance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId,
            @Valid @RequestBody CreateAssetMaintenanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(assetService.addMaintenance(principal, assetId, request)));
    }

    @GetMapping("/{assetId}/maintenance")
    @PreAuthorize("hasAuthority('asset:read')")
    public ResponseEntity<ApiResponse<List<AssetMaintenanceResponse>>> listMaintenance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId) {
        return ResponseEntity.ok(ApiResponse.ok(assetService.listMaintenance(principal, assetId)));
    }
}
