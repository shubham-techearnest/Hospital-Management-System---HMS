package com.health360.radiology.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.radiology.application.service.RadiologyCatalogService;
import com.health360.radiology.application.service.RadiologyFulfillmentService;
import com.health360.radiology.presentation.dto.request.*;
import com.health360.radiology.presentation.dto.response.*;
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
@RequestMapping("/api/v1/radiology")
@RequiredArgsConstructor
public class RadiologyController {

    private final RadiologyCatalogService catalogService;
    private final RadiologyFulfillmentService fulfillmentService;

    @PostMapping("/modalities")
    @PreAuthorize("hasAuthority('radiology:modality:write')")
    public ResponseEntity<ApiResponse<ImagingModalityResponse>> createModality(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateImagingModalityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                catalogService.createModality(principal, request)));
    }

    @GetMapping("/modalities")
    @PreAuthorize("hasAuthority('radiology:modality:read')")
    public ResponseEntity<ApiResponse<List<ImagingModalityResponse>>> listModalities(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.listModalities(principal, hospitalId, branchId)));
    }

    @GetMapping("/worklist/pending")
    @PreAuthorize("hasAuthority('radiology:order:read')")
    public ResponseEntity<ApiResponse<List<ImagingWorklistItemResponse>>> listPendingWorklist(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.listPendingWorklist(principal, hospitalId, branchId)));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAuthority('radiology:order:write')")
    public ResponseEntity<ApiResponse<ImagingOrderResponse>> createImagingOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateImagingOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                fulfillmentService.createImagingOrder(principal, request)));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('radiology:order:read')")
    public ResponseEntity<ApiResponse<Page<ImagingOrderResponse>>> listImagingOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.listImagingOrders(principal, hospitalId, branchId, status, pageable)));
    }

    @GetMapping("/orders/{imagingOrderId}")
    @PreAuthorize("hasAuthority('radiology:order:read')")
    public ResponseEntity<ApiResponse<ImagingOrderResponse>> getImagingOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID imagingOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.getImagingOrder(principal, imagingOrderId)));
    }

    @PostMapping("/orders/{imagingOrderId}/schedule")
    @PreAuthorize("hasAuthority('radiology:order:write')")
    public ResponseEntity<ApiResponse<ImagingOrderResponse>> scheduleStudy(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID imagingOrderId,
            @Valid @RequestBody ScheduleImagingStudyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.scheduleStudy(principal, imagingOrderId, request)));
    }

    @PostMapping("/orders/{imagingOrderId}/perform")
    @PreAuthorize("hasAuthority('radiology:order:write')")
    public ResponseEntity<ApiResponse<ImagingOrderResponse>> performStudy(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID imagingOrderId,
            @Valid @RequestBody PerformImagingStudyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.performStudy(principal, imagingOrderId, request)));
    }

    @PostMapping("/orders/{imagingOrderId}/report")
    @PreAuthorize("hasAuthority('radiology:report:write')")
    public ResponseEntity<ApiResponse<ImagingOrderResponse>> enterReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID imagingOrderId,
            @Valid @RequestBody EnterImagingReportRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.enterReport(principal, imagingOrderId, request)));
    }

    @PostMapping("/orders/{imagingOrderId}/verify")
    @PreAuthorize("hasAuthority('radiology:report:verify')")
    public ResponseEntity<ApiResponse<ImagingOrderResponse>> verifyReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID imagingOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.verifyReport(principal, imagingOrderId)));
    }

    @PostMapping("/orders/{imagingOrderId}/release")
    @PreAuthorize("hasAuthority('radiology:report:release')")
    public ResponseEntity<ApiResponse<ImagingReportResponse>> releaseReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID imagingOrderId,
            @Valid @RequestBody ReleaseImagingReportRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.releaseReport(principal, imagingOrderId, request)));
    }

    @GetMapping("/encounters/{encounterId}/reports")
    @PreAuthorize("hasAnyAuthority('radiology:order:read', 'clinical:encounter:read', 'clinical:encounter:write')")
    public ResponseEntity<ApiResponse<List<ImagingReportResponse>>> listEncounterReports(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.listReleasedReportsForEncounter(principal, encounterId)));
    }
}
