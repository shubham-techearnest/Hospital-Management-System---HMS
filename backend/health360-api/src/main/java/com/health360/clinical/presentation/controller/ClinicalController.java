package com.health360.clinical.presentation.controller;

import com.health360.clinical.application.service.ClinicalOrderService;
import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.presentation.dto.request.*;
import com.health360.clinical.presentation.dto.response.*;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clinical")
@RequiredArgsConstructor
public class ClinicalController {

    private final EncounterService encounterService;
    private final ClinicalOrderService clinicalOrderService;

    @PostMapping("/encounters")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<EncounterResponse>> createEncounter(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateEncounterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                encounterService.createEncounter(principal, request)));
    }

    @GetMapping("/encounters")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<Page<EncounterResponse>>> listEncounters(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID doctorId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.listEncounters(principal, patientId, hospitalId, doctorId, pageable)));
    }

    @GetMapping("/encounters/{encounterId}")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<EncounterResponse>> getEncounter(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.getEncounter(principal, encounterId)));
    }

    @PatchMapping("/encounters/{encounterId}/status")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<EncounterResponse>> updateEncounterStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody UpdateEncounterStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.updateEncounterStatus(principal, encounterId, request)));
    }

    @PostMapping("/encounters/{encounterId}/diagnoses")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<DiagnosisResponse>> addDiagnosis(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateDiagnosisRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                encounterService.addDiagnosis(principal, encounterId, request)));
    }

    @GetMapping("/encounters/{encounterId}/diagnoses")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<List<DiagnosisResponse>>> listDiagnoses(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.listDiagnoses(principal, encounterId)));
    }

    @PostMapping("/encounters/{encounterId}/notes")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<ClinicalNoteResponse>> addNote(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateClinicalNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                encounterService.addNote(principal, encounterId, request)));
    }

    @GetMapping("/encounters/{encounterId}/notes")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<List<ClinicalNoteResponse>>> listNotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.listNotes(principal, encounterId)));
    }

    @PostMapping("/encounters/{encounterId}/orders")
    @PreAuthorize("hasAuthority('clinical:order:write')")
    public ResponseEntity<ApiResponse<ClinicalOrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateClinicalOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                clinicalOrderService.createOrder(principal, encounterId, request)));
    }

    @GetMapping("/encounters/{encounterId}/orders")
    @PreAuthorize("hasAuthority('clinical:order:read')")
    public ResponseEntity<ApiResponse<List<ClinicalOrderResponse>>> listOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalOrderService.listOrders(principal, encounterId)));
    }

    @GetMapping("/encounters/{encounterId}/orders/{orderId}")
    @PreAuthorize("hasAuthority('clinical:order:read')")
    public ResponseEntity<ApiResponse<ClinicalOrderResponse>> getOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalOrderService.getOrder(principal, encounterId, orderId)));
    }
}
