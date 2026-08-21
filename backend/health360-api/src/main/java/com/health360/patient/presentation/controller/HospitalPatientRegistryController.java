package com.health360.patient.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.patient.application.service.HospitalPatientRegistryService;
import com.health360.patient.presentation.dto.request.RegisterHospitalPatientRequest;
import com.health360.patient.presentation.dto.response.HospitalPatientSummaryResponse;
import com.health360.patient.presentation.dto.response.PortalInviteResponse;
import com.health360.patient.presentation.dto.response.RegisterHospitalPatientResponse;
import com.health360.patient.presentation.dto.response.RegistrationReceiptResponse;
import com.health360.patient.application.service.PatientPortalInviteService;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hospital/patients")
@RequiredArgsConstructor
public class HospitalPatientRegistryController {

    private final HospitalPatientRegistryService registryService;
    private final PatientPortalInviteService portalInviteService;

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('patient:registry:read')")
    public ResponseEntity<ApiResponse<Page<HospitalPatientSummaryResponse>>> searchPatients(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String uhid,
            @RequestParam(required = false) String mobile,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateOfBirth,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                registryService.searchPatients(principal, uhid, mobile, firstName, lastName, dateOfBirth, pageable)));
    }

    @PostMapping("/register")
    @PreAuthorize("hasAuthority('patient:registry:write')")
    public ResponseEntity<ApiResponse<RegisterHospitalPatientResponse>> registerPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RegisterHospitalPatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok(registryService.registerPatient(principal, request)));
    }

    @PostMapping("/{patientId}/link")
    @PreAuthorize("hasAuthority('patient:registry:write')")
    public ResponseEntity<ApiResponse<RegisterHospitalPatientResponse>> linkExistingPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID patientId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok(registryService.linkExistingPatientToHospital(principal, patientId)));
    }

    @GetMapping("/{patientId}")
    @PreAuthorize("hasAuthority('patient:registry:read')")
    public ResponseEntity<ApiResponse<HospitalPatientSummaryResponse>> getPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.ok(registryService.getPatient(principal, patientId)));
    }

    @GetMapping("/{patientId}/registration-receipt")
    @PreAuthorize("hasAuthority('patient:registry:read')")
    public ResponseEntity<ApiResponse<RegistrationReceiptResponse>> getRegistrationReceipt(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.ok(registryService.getRegistrationReceipt(principal, patientId)));
    }

    @PostMapping("/{patientId}/portal-invite")
    @PreAuthorize("hasAuthority('patient:registry:write')")
    public ResponseEntity<ApiResponse<PortalInviteResponse>> createPortalInvite(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.ok(portalInviteService.createInvite(principal, patientId)));
    }
}
