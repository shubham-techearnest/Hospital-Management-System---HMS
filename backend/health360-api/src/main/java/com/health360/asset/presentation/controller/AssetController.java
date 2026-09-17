package com.health360.asset.presentation.controller;

import com.health360.asset.application.service.AssetEamService;
import com.health360.asset.application.service.AssetService;
import com.health360.asset.presentation.dto.request.CompleteAssetTicketRequest;
import com.health360.asset.presentation.dto.request.CreateAssetMaintenanceRequest;
import com.health360.asset.presentation.dto.request.CreateAssetRequest;
import com.health360.asset.presentation.dto.request.CreateAssetScheduleRequest;
import com.health360.asset.presentation.dto.request.ReportAssetBreakdownRequest;
import com.health360.asset.presentation.dto.request.UpdateAssetRequest;
import com.health360.asset.presentation.dto.request.UpdateAssetStatusRequest;
import com.health360.asset.presentation.dto.response.AssetCategoryResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceScheduleResponse;
import com.health360.asset.presentation.dto.response.AssetMaintenanceTicketResponse;
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
    private final AssetEamService assetEamService;

    @GetMapping("/categories")
    @PreAuthorize("hasAuthority('asset:read')")
    public ResponseEntity<ApiResponse<List<AssetCategoryResponse>>> listCategories(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(assetService.listCategories(principal)));
    }

    @GetMapping("/lookup")
    @PreAuthorize("hasAuthority('asset:read')")
    public ResponseEntity<ApiResponse<AssetResponse>> lookupByQr(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam String qr) {
        return ResponseEntity.ok(ApiResponse.ok(assetEamService.lookupByQr(principal, hospitalId, qr)));
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

    @GetMapping("/tickets")
    @PreAuthorize("hasAuthority('asset:read')")
    public ResponseEntity<ApiResponse<Page<AssetMaintenanceTicketResponse>>> listTickets(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                assetEamService.listTickets(principal, hospitalId, branchId, status, pageable)));
    }

    @PostMapping("/tickets/{ticketId}/complete")
    @PreAuthorize("hasAuthority('asset:ticket:write') or hasAuthority('asset:maintenance:write') or hasAuthority('asset:write')")
    public ResponseEntity<ApiResponse<AssetMaintenanceTicketResponse>> completeTicket(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID ticketId,
            @RequestBody(required = false) CompleteAssetTicketRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(assetEamService.completeTicket(
                principal, ticketId, request != null ? request : new CompleteAssetTicketRequest())));
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasAuthority('asset:maintenance:write') or hasAuthority('asset:write')")
    public ResponseEntity<ApiResponse<AssetMaintenanceScheduleResponse>> createSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAssetScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(assetEamService.createSchedule(principal, request)));
    }

    @PostMapping("/schedules/generate-due")
    @PreAuthorize("hasAuthority('asset:maintenance:write') or hasAuthority('asset:write')")
    public ResponseEntity<ApiResponse<List<AssetMaintenanceTicketResponse>>> generateDue(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                assetEamService.generateDueTickets(principal, hospitalId, branchId)));
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
    @PreAuthorize("hasAuthority('asset:write') or hasAuthority('asset:dispose')")
    public ResponseEntity<ApiResponse<AssetResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId,
            @Valid @RequestBody UpdateAssetStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(assetService.updateStatus(principal, assetId, request)));
    }

    @PostMapping("/{assetId}/commission")
    @PreAuthorize("hasAuthority('asset:write')")
    public ResponseEntity<ApiResponse<AssetResponse>> commission(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId) {
        return ResponseEntity.ok(ApiResponse.ok(assetEamService.commission(principal, assetId)));
    }

    @PostMapping("/{assetId}/breakdown")
    @PreAuthorize("hasAuthority('asset:ticket:write') or hasAuthority('asset:maintenance:write') or hasAuthority('asset:write')")
    public ResponseEntity<ApiResponse<AssetMaintenanceTicketResponse>> reportBreakdown(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId,
            @Valid @RequestBody ReportAssetBreakdownRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(assetEamService.reportBreakdown(principal, assetId, request)));
    }

    @GetMapping("/{assetId}/tickets")
    @PreAuthorize("hasAuthority('asset:read')")
    public ResponseEntity<ApiResponse<List<AssetMaintenanceTicketResponse>>> listAssetTickets(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId) {
        return ResponseEntity.ok(ApiResponse.ok(assetEamService.listTicketsForAsset(principal, assetId)));
    }

    @GetMapping("/{assetId}/schedules")
    @PreAuthorize("hasAuthority('asset:read')")
    public ResponseEntity<ApiResponse<List<AssetMaintenanceScheduleResponse>>> listSchedules(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assetId) {
        return ResponseEntity.ok(ApiResponse.ok(assetEamService.listSchedules(principal, assetId)));
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
