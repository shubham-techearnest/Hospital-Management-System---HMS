package com.health360.ipd.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.ipd.application.service.IpdAdmissionRequestService;
import com.health360.ipd.application.service.IpdAdmissionService;
import com.health360.ipd.application.service.IpdBillingService;
import com.health360.ipd.application.service.IpdCareTransitionService;
import com.health360.ipd.application.service.IpdDischargeService;
import com.health360.ipd.application.service.IpdFacilityService;
import com.health360.ipd.application.service.IpdMedicationReconciliationService;
import com.health360.ipd.application.service.IpdPostDischargeService;
import com.health360.billing.presentation.dto.response.InvoiceResponse;
import com.health360.ipd.presentation.dto.request.*;
import com.health360.ipd.presentation.dto.response.*;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ipd")
@RequiredArgsConstructor
public class IpdController {

    private final IpdFacilityService facilityService;
    private final IpdAdmissionService admissionService;
    private final IpdAdmissionRequestService admissionRequestService;
    private final IpdMedicationReconciliationService medicationReconciliationService;
    private final IpdCareTransitionService careTransitionService;
    private final IpdBillingService billingService;
    private final IpdDischargeService dischargeWorkflowService;
    private final IpdPostDischargeService postDischargeService;

    @GetMapping("/admission-request-catalogs")
    @PreAuthorize("hasAuthority('ipd:admission-request:read') or hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<IpdAdmissionRequestResponse.Catalogs>> admissionRequestCatalogs() {
        return ResponseEntity.ok(ApiResponse.ok(admissionRequestService.catalogs()));
    }

    @PostMapping("/admission-requests")
    @PreAuthorize("hasAuthority('ipd:admission-request:create') or hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionRequestResponse>> createAdmissionRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAdmissionRequestPayload request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                admissionRequestService.create(principal, request)));
    }

    @GetMapping("/admission-requests")
    @PreAuthorize("hasAuthority('ipd:admission-request:read') or hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<Page<IpdAdmissionRequestResponse>>> listAdmissionRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                admissionRequestService.list(principal, hospitalId, branchId, status, pageable)));
    }

    @GetMapping("/admission-requests/{requestId}")
    @PreAuthorize("hasAuthority('ipd:admission-request:read') or hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<IpdAdmissionRequestResponse>> getAdmissionRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.ok(admissionRequestService.get(principal, requestId)));
    }

    @PostMapping("/admission-requests/{requestId}/start-review")
    @PreAuthorize("hasAuthority('ipd:admission-request:review') or hasAuthority('ipd:admin')")
    public ResponseEntity<ApiResponse<IpdAdmissionRequestResponse>> startReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.ok(admissionRequestService.startReview(principal, requestId)));
    }

    @PostMapping("/admission-requests/{requestId}/approve")
    @PreAuthorize("hasAuthority('ipd:admission-request:review') or hasAuthority('ipd:admin')")
    public ResponseEntity<ApiResponse<IpdAdmissionRequestResponse>> approveAdmissionRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @RequestBody(required = false) ReviewAdmissionRequestPayload payload) {
        return ResponseEntity.ok(ApiResponse.ok(
                admissionRequestService.approve(principal, requestId, payload != null ? payload : new ReviewAdmissionRequestPayload())));
    }

    @PostMapping("/admission-requests/{requestId}/reject")
    @PreAuthorize("hasAuthority('ipd:admission-request:review') or hasAuthority('ipd:admin')")
    public ResponseEntity<ApiResponse<IpdAdmissionRequestResponse>> rejectAdmissionRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @Valid @RequestBody ReviewAdmissionRequestPayload payload) {
        return ResponseEntity.ok(ApiResponse.ok(admissionRequestService.reject(principal, requestId, payload)));
    }

    @PostMapping("/admission-requests/{requestId}/schedule")
    @PreAuthorize("hasAuthority('ipd:admission-request:review') or hasAuthority('ipd:admin')")
    public ResponseEntity<ApiResponse<IpdAdmissionRequestResponse>> scheduleAdmissionRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @Valid @RequestBody ReviewAdmissionRequestPayload payload) {
        return ResponseEntity.ok(ApiResponse.ok(admissionRequestService.schedule(principal, requestId, payload)));
    }

    @PostMapping("/admission-requests/{requestId}/cancel")
    @PreAuthorize("hasAuthority('ipd:admission-request:create') or hasAuthority('ipd:admission-request:review') or hasAuthority('ipd:admin')")
    public ResponseEntity<ApiResponse<IpdAdmissionRequestResponse>> cancelAdmissionRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @RequestBody(required = false) ReviewAdmissionRequestPayload payload) {
        return ResponseEntity.ok(ApiResponse.ok(
                admissionRequestService.cancel(principal, requestId, payload != null ? payload : new ReviewAdmissionRequestPayload())));
    }

    @PostMapping("/admission-requests/{requestId}/reserve-bed")
    @PreAuthorize("hasAuthority('ipd:admission-request:review') or hasAuthority('ipd:admin')")
    public ResponseEntity<ApiResponse<IpdAdmissionRequestResponse>> reserveAdmissionBed(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId,
            @Valid @RequestBody ReserveAdmissionBedRequest payload) {
        return ResponseEntity.ok(ApiResponse.ok(
                admissionRequestService.reserveBed(principal, requestId, payload)));
    }

    @PostMapping("/wards")
    @PreAuthorize("hasAuthority('ipd:ward:write')")
    public ResponseEntity<ApiResponse<IpdWardResponse>> createWard(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIpdWardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                facilityService.createWard(principal, request)));
    }

    @GetMapping("/wards")
    @PreAuthorize("hasAuthority('ipd:ward:read')")
    public ResponseEntity<ApiResponse<List<IpdWardResponse>>> listWards(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                facilityService.listWards(principal, hospitalId, branchId)));
    }

    @PostMapping("/rooms")
    @PreAuthorize("hasAuthority('ipd:ward:write')")
    public ResponseEntity<ApiResponse<IpdRoomResponse>> createRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIpdRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                facilityService.createRoom(principal, request)));
    }

    @GetMapping("/rooms")
    @PreAuthorize("hasAuthority('ipd:ward:read')")
    public ResponseEntity<ApiResponse<List<IpdRoomResponse>>> listRooms(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID wardId) {
        return ResponseEntity.ok(ApiResponse.ok(facilityService.listRooms(principal, wardId)));
    }

    @PostMapping("/beds")
    @PreAuthorize("hasAuthority('ipd:bed:write')")
    public ResponseEntity<ApiResponse<IpdBedResponse>> createBed(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIpdBedRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                facilityService.createBed(principal, request)));
    }

    @GetMapping("/beds")
    @PreAuthorize("hasAuthority('ipd:bed:read')")
    public ResponseEntity<ApiResponse<List<IpdBedResponse>>> listBeds(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(
                facilityService.listBeds(principal, hospitalId, branchId, status)));
    }

    @PostMapping("/beds/{bedId}/status")
    @PreAuthorize("hasAuthority('ipd:bed:write')")
    public ResponseEntity<ApiResponse<IpdBedResponse>> updateBedStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID bedId,
            @Valid @RequestBody UpdateIpdBedStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                facilityService.updateBedStatus(principal, bedId, request)));
    }

    @PostMapping("/admissions")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> admitPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIpdAdmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                admissionService.admitPatient(principal, request)));
    }

    @GetMapping("/admissions")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<Page<IpdAdmissionResponse>>> listAdmissions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                admissionService.listAdmissions(principal, hospitalId, branchId, status, pageable)));
    }

    @GetMapping("/admissions/{admissionId}")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> getAdmission(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(admissionService.getAdmission(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/rounds")
    @PreAuthorize("hasAuthority('ipd:round:write')")
    public ResponseEntity<ApiResponse<IpdRoundResponse>> addRound(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody CreateIpdRoundRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                admissionService.addRound(principal, admissionId, request)));
    }

    @GetMapping("/admissions/{admissionId}/rounds")
    @PreAuthorize("hasAuthority('ipd:round:read')")
    public ResponseEntity<ApiResponse<List<IpdRoundResponse>>> listRounds(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(admissionService.listRounds(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/transfer-bed")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> transferBed(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody TransferIpdBedRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                admissionService.transferBed(principal, admissionId, request)));
    }

    @PostMapping("/admissions/{admissionId}/discharge")
    @PreAuthorize("hasAuthority('ipd:discharge:write')")
    public ResponseEntity<ApiResponse<IpdDischargeResponse>> dischargePatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody DischargeIpdPatientRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                admissionService.dischargePatient(principal, admissionId, request)));
    }

    @GetMapping("/admissions/{admissionId}/med-reconciliations")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<List<MedicationReconciliationResponse>>> listMedReconciliations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                medicationReconciliationService.list(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/med-reconciliations")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<MedicationReconciliationResponse>> createMedReconciliation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody CreateMedicationReconciliationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                medicationReconciliationService.create(principal, admissionId, request)));
    }

    @PostMapping("/admissions/{admissionId}/escalate-to-icu")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> escalateToIcu(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody EscalateToIcuRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                careTransitionService.escalateToIcu(principal, admissionId, request)));
    }

    @PostMapping("/admissions/{admissionId}/step-down-from-icu")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> stepDownFromIcu(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody StepDownFromIcuRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                careTransitionService.stepDownFromIcu(principal, admissionId, request)));
    }

    @PatchMapping("/admissions/{admissionId}/isolation")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> updateIsolation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody UpdateIpdIsolationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                careTransitionService.updateIsolation(principal, admissionId, request)));
    }

    @GetMapping("/admissions/{admissionId}/blood-requests")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<List<IpdBloodRequestResponse>>> listBloodRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                careTransitionService.listBloodRequests(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/blood-requests")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdBloodRequestResponse>> createBloodRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody CreateBloodRequestPayload request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                careTransitionService.createBloodRequest(principal, admissionId, request)));
    }

    @GetMapping("/admissions/{admissionId}/charge-events")
    @PreAuthorize("hasAuthority('ipd:admission:read') or hasAuthority('billing:invoice:read')")
    public ResponseEntity<ApiResponse<List<IpdChargeEventResponse>>> listChargeEvents(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(billingService.listChargeEvents(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/charge-events")
    @PreAuthorize("hasAuthority('ipd:admission:write') or hasAuthority('billing:invoice:write')")
    public ResponseEntity<ApiResponse<IpdChargeEventResponse>> createChargeEvent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody CreateIpdChargeEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                billingService.createChargeEvent(principal, admissionId, request)));
    }

    @PostMapping("/admissions/{admissionId}/interim-invoice")
    @PreAuthorize("hasAuthority('billing:invoice:write') or hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> postInterimInvoice(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                billingService.postPendingCharges(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/deposit")
    @PreAuthorize("hasAuthority('billing:invoice:write') or hasAuthority('billing:payment:write') or hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createDeposit(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody CreateIpdDepositRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                billingService.createDeposit(principal, admissionId, request)));
    }

    @GetMapping("/admissions/{admissionId}/payers")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<List<IpdAdmissionPayerResponse>>> listPayers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(billingService.listPayers(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/payers")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionPayerResponse>> assignPayer(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody AssignIpdPayerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                billingService.assignPayer(principal, admissionId, request)));
    }

    @GetMapping("/admissions/{admissionId}/payer-authorizations")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<List<IpdPayerAuthorizationResponse>>> listAuthorizations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(billingService.listAuthorizations(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/payer-authorizations")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdPayerAuthorizationResponse>> createAuthorization(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody CreatePayerAuthorizationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                billingService.createAuthorization(principal, admissionId, request)));
    }

    @PostMapping("/admissions/{admissionId}/payer-authorizations/{authorizationId}/decide")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdPayerAuthorizationResponse>> decideAuthorization(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @PathVariable UUID authorizationId,
            @Valid @RequestBody DecidePayerAuthorizationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                billingService.decideAuthorization(principal, admissionId, authorizationId, request)));
    }

    @GetMapping("/admissions/{admissionId}/financial-clearance")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<IpdFinancialClearanceResponse>> getFinancialClearance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                billingService.getFinancialClearance(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/financial-clearance")
    @PreAuthorize("hasAuthority('ipd:admission:write') or hasAuthority('billing:invoice:write')")
    public ResponseEntity<ApiResponse<IpdFinancialClearanceResponse>> clearFinancial(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @RequestBody(required = false) ClearIpdFinancialRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                billingService.clearFinancial(
                        principal, admissionId, request != null ? request : new ClearIpdFinancialRequest())));
    }

    @GetMapping("/admissions/{admissionId}/discharge-plan")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<IpdDischargePlanResponse>> getDischargePlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(dischargeWorkflowService.getPlan(principal, admissionId)));
    }

    @PutMapping("/admissions/{admissionId}/discharge-plan")
    @PreAuthorize("hasAuthority('ipd:admission:write') or hasAuthority('ipd:discharge:write')")
    public ResponseEntity<ApiResponse<IpdDischargePlanResponse>> upsertDischargePlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody UpsertDischargePlanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                dischargeWorkflowService.upsertPlan(principal, admissionId, request)));
    }

    @GetMapping("/admissions/{admissionId}/discharge-orders")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<List<IpdDischargeOrderResponse>>> listDischargeOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(dischargeWorkflowService.listOrders(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/discharge-order")
    @PreAuthorize("hasAuthority('ipd:admission:write') or hasAuthority('ipd:discharge:write')")
    public ResponseEntity<ApiResponse<IpdDischargeOrderResponse>> placeDischargeOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @RequestBody(required = false) CreateDischargeOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                dischargeWorkflowService.placeOrder(
                        principal, admissionId, request != null ? request : new CreateDischargeOrderRequest())));
    }

    @GetMapping("/admissions/{admissionId}/discharge-clearances")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<List<IpdDischargeClearanceResponse>>> listDischargeClearances(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dischargeWorkflowService.ensureAndListClearances(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/discharge-clearances")
    @PreAuthorize("hasAuthority('ipd:admission:write') or hasAuthority('ipd:discharge:write')")
    public ResponseEntity<ApiResponse<IpdDischargeClearanceResponse>> updateDischargeClearance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody UpdateDischargeClearanceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                dischargeWorkflowService.updateClearance(principal, admissionId, request)));
    }

    @GetMapping("/admissions/{admissionId}/discharge-summary")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<IpdDischargeResponse>> getDischargeSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dischargeWorkflowService.getLatestSummary(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/follow-up")
    @PreAuthorize("hasAuthority('ipd:admission:write') or hasAuthority('ipd:discharge:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> scheduleFollowUp(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody ScheduleIpdFollowUpRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                postDischargeService.scheduleFollowUp(principal, admissionId, request)));
    }

    @PostMapping("/admissions/{admissionId}/close-episode")
    @PreAuthorize("hasAuthority('ipd:admission:write') or hasAuthority('ipd:discharge:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> closeEpisode(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                postDischargeService.closeEpisode(principal, admissionId)));
    }

    @GetMapping("/readmission-analytics")
    @PreAuthorize("hasAuthority('ipd:admission:read') or hasAuthority('ipd:admin')")
    public ResponseEntity<ApiResponse<IpdReadmissionAnalyticsResponse>> readmissionAnalytics(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        return ResponseEntity.ok(ApiResponse.ok(
                postDischargeService.readmissionAnalytics(principal, hospitalId, from, to)));
    }
}
