package com.health360.hospital.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalClinicalCatalogService;
import com.health360.hospital.presentation.dto.request.CreateDiagnosisCatalogRequest;
import com.health360.hospital.presentation.dto.request.CreateDosageTemplateRequest;
import com.health360.hospital.presentation.dto.request.CreateSymptomCatalogRequest;
import com.health360.hospital.presentation.dto.response.DiagnosisCatalogResponse;
import com.health360.hospital.presentation.dto.response.DosageTemplateResponse;
import com.health360.hospital.presentation.dto.response.SymptomCatalogResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hospital/catalogs")
@RequiredArgsConstructor
public class HospitalClinicalCatalogController {

    private final HospitalClinicalCatalogService catalogService;

    @GetMapping("/symptoms")
    @PreAuthorize("hasAnyAuthority('hospital:catalog:read', 'hospital:catalog:write')")
    public ResponseEntity<ApiResponse<List<SymptomCatalogResponse>>> listSymptoms(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.listSymptoms(principal, hospitalId, branchId)));
    }

    @PostMapping("/symptoms")
    @PreAuthorize("hasAuthority('hospital:catalog:write')")
    public ResponseEntity<ApiResponse<SymptomCatalogResponse>> createSymptom(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateSymptomCatalogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                catalogService.createSymptom(principal, request)));
    }

    @GetMapping("/dosage-templates")
    @PreAuthorize("hasAnyAuthority('hospital:catalog:read', 'hospital:catalog:write')")
    public ResponseEntity<ApiResponse<List<DosageTemplateResponse>>> listDosageTemplates(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.listDosageTemplates(principal, hospitalId, branchId)));
    }

    @PostMapping("/dosage-templates")
    @PreAuthorize("hasAuthority('hospital:catalog:write')")
    public ResponseEntity<ApiResponse<DosageTemplateResponse>> createDosageTemplate(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateDosageTemplateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                catalogService.createDosageTemplate(principal, request)));
    }

    @GetMapping("/diagnoses")
    @PreAuthorize("hasAnyAuthority('hospital:catalog:read', 'hospital:catalog:write')")
    public ResponseEntity<ApiResponse<List<DiagnosisCatalogResponse>>> listDiagnoses(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.listDiagnoses(principal, hospitalId, branchId, q)));
    }

    @PostMapping("/diagnoses")
    @PreAuthorize("hasAuthority('hospital:catalog:write')")
    public ResponseEntity<ApiResponse<DiagnosisCatalogResponse>> createDiagnosis(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateDiagnosisCatalogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                catalogService.createDiagnosis(principal, request)));
    }
}
