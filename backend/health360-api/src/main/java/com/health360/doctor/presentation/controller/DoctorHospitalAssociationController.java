package com.health360.doctor.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.doctor.application.service.DoctorHospitalAssociationService;
import com.health360.doctor.presentation.dto.request.CreateHospitalAssociationRequest;
import com.health360.doctor.presentation.dto.response.HospitalAssociationResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/doctors/me/hospital-associations")
@RequiredArgsConstructor
public class DoctorHospitalAssociationController {

    private final DoctorHospitalAssociationService associationService;

    @GetMapping
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<List<HospitalAssociationResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                associationService.listAssociations(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<HospitalAssociationResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateHospitalAssociationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                associationService.createAssociation(principal.getUserId(), principal.getTenantId(), request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        associationService.deleteAssociation(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.message("Association removed"));
    }
}
