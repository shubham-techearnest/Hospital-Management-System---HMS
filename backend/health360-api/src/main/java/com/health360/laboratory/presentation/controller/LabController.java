package com.health360.laboratory.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.laboratory.application.service.LabCatalogService;
import com.health360.laboratory.application.service.LabFulfillmentService;
import com.health360.laboratory.presentation.dto.request.*;
import com.health360.laboratory.presentation.dto.response.*;
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
@RequestMapping("/api/v1/lab")
@RequiredArgsConstructor
public class LabController {

    private final LabCatalogService catalogService;
    private final LabFulfillmentService fulfillmentService;

    @PostMapping("/laboratories")
    @PreAuthorize("hasAuthority('lab:catalog:write')")
    public ResponseEntity<ApiResponse<LaboratoryResponse>> createLaboratory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateLaboratoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                catalogService.createLaboratory(principal, request)));
    }

    @GetMapping("/laboratories")
    @PreAuthorize("hasAuthority('lab:catalog:read')")
    public ResponseEntity<ApiResponse<List<LaboratoryResponse>>> listLaboratories(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.listLaboratories(principal, hospitalId, branchId)));
    }

    @PostMapping("/tests")
    @PreAuthorize("hasAuthority('lab:catalog:write')")
    public ResponseEntity<ApiResponse<LabTestResponse>> createTest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateLabTestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                catalogService.createTest(principal, request)));
    }

    @GetMapping("/tests")
    @PreAuthorize("hasAuthority('lab:catalog:read')")
    public ResponseEntity<ApiResponse<List<LabTestResponse>>> listTests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID laboratoryId,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        if (laboratoryId != null) {
            return ResponseEntity.ok(ApiResponse.ok(
                    catalogService.listTests(principal, laboratoryId)));
        }
        if (hospitalId != null && branchId != null) {
            return ResponseEntity.ok(ApiResponse.ok(
                    catalogService.listTestsForBranch(principal, hospitalId, branchId)));
        }
        throw new IllegalArgumentException("Provide laboratoryId or hospitalId and branchId");
    }

    @PostMapping("/tests/{labTestId}/parameters")
    @PreAuthorize("hasAuthority('lab:catalog:write')")
    public ResponseEntity<ApiResponse<LabTestParameterResponse>> createParameter(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID labTestId,
            @Valid @RequestBody CreateLabTestParameterRequest request) {
        request.setLabTestId(labTestId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                catalogService.createParameter(principal, request)));
    }

    @GetMapping("/tests/{labTestId}/parameters")
    @PreAuthorize("hasAuthority('lab:catalog:read')")
    public ResponseEntity<ApiResponse<List<LabTestParameterResponse>>> listParameters(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID labTestId) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.listParameters(principal, labTestId)));
    }

    @GetMapping("/worklist/pending")
    @PreAuthorize("hasAuthority('lab:order:read')")
    public ResponseEntity<ApiResponse<List<LabWorklistItemResponse>>> listPendingWorklist(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.listPendingWorklist(principal, hospitalId, branchId)));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAuthority('lab:order:write')")
    public ResponseEntity<ApiResponse<LabOrderResponse>> createLabOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateLabOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                fulfillmentService.createLabOrder(principal, request)));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('lab:order:read')")
    public ResponseEntity<ApiResponse<Page<LabOrderResponse>>> listLabOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.listLabOrders(principal, hospitalId, branchId, status, pageable)));
    }

    @GetMapping("/orders/{labOrderId}")
    @PreAuthorize("hasAuthority('lab:order:read')")
    public ResponseEntity<ApiResponse<LabOrderResponse>> getLabOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID labOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.getLabOrder(principal, labOrderId)));
    }

    @PostMapping("/orders/{labOrderId}/collect-sample")
    @PreAuthorize("hasAuthority('lab:order:write')")
    public ResponseEntity<ApiResponse<LabOrderResponse>> collectSample(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID labOrderId,
            @Valid @RequestBody CollectLabSampleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.collectSample(principal, labOrderId, request)));
    }

    @PostMapping("/orders/{labOrderId}/results")
    @PreAuthorize("hasAuthority('lab:result:write')")
    public ResponseEntity<ApiResponse<LabOrderResponse>> enterResults(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID labOrderId,
            @Valid @RequestBody EnterLabResultsRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.enterResults(principal, labOrderId, request)));
    }

    @PostMapping("/orders/{labOrderId}/verify")
    @PreAuthorize("hasAuthority('lab:result:verify')")
    public ResponseEntity<ApiResponse<LabOrderResponse>> verifyResults(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID labOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.verifyResults(principal, labOrderId)));
    }

    @PostMapping("/orders/{labOrderId}/release")
    @PreAuthorize("hasAuthority('lab:report:release')")
    public ResponseEntity<ApiResponse<LabReportResponse>> releaseReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID labOrderId,
            @Valid @RequestBody ReleaseLabReportRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.releaseReport(principal, labOrderId, request)));
    }

    @GetMapping("/encounters/{encounterId}/reports")
    @PreAuthorize("hasAnyAuthority('lab:order:read', 'clinical:encounter:read', 'clinical:encounter:write')")
    public ResponseEntity<ApiResponse<List<LabReportResponse>>> listEncounterReports(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fulfillmentService.listReleasedReportsForEncounter(principal, encounterId)));
    }
}
