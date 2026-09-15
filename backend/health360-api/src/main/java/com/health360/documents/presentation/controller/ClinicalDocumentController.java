package com.health360.documents.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.documents.application.service.ClinicalDocumentService;
import com.health360.documents.presentation.dto.response.ClinicalDocumentResponse;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ClinicalDocumentController {

    private final ClinicalDocumentService clinicalDocumentService;

    @GetMapping("/clinical/encounters/{encounterId}/documents/prescription/{prescriptionId}")
    @PreAuthorize("hasAuthority('clinical:prescription:read') or hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<ClinicalDocumentResponse>> prescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @PathVariable UUID prescriptionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalDocumentService.prescriptionDocument(principal, encounterId, prescriptionId)));
    }

    @GetMapping("/clinical/encounters/{encounterId}/documents/consultation/{noteId}")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<ClinicalDocumentResponse>> consultation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @PathVariable UUID noteId) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalDocumentService.consultationDocument(principal, encounterId, noteId)));
    }

    @GetMapping("/lab/orders/{labOrderId}/documents/report")
    @PreAuthorize("hasAuthority('lab:order:read') or hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<ClinicalDocumentResponse>> labReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID labOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalDocumentService.labReportDocument(principal, labOrderId)));
    }

    @GetMapping("/pharmacy/requests/{requestId}/documents/dispense-slip")
    @PreAuthorize("hasAuthority('pharmacy:request:read') or hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<ClinicalDocumentResponse>> pharmacySlip(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalDocumentService.pharmacyDispenseSlip(principal, requestId)));
    }
}
