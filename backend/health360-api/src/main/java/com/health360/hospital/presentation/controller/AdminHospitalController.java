package com.health360.hospital.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.doctor.application.service.DoctorInviteService;
import com.health360.doctor.presentation.dto.request.InviteDoctorRequest;
import com.health360.doctor.presentation.dto.response.InviteDoctorResponse;
import com.health360.hospital.application.service.AdminHospitalService;
import com.health360.hospital.presentation.dto.request.UpdateHospitalStatusRequest;
import com.health360.hospital.presentation.dto.response.AdminHospitalResponse;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/hospitals")
@RequiredArgsConstructor
public class AdminHospitalController {

    private final AdminHospitalService adminHospitalService;
    private final DoctorInviteService doctorInviteService;

    @GetMapping
    @PreAuthorize("hasAuthority('admin:hospitals:read')")
    public ResponseEntity<ApiResponse<Page<AdminHospitalResponse>>> listHospitals(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminHospitalService.searchHospitals(principal.getTenantId(), name, status, pageable)));
    }

    @GetMapping("/{hospitalId}")
    @PreAuthorize("hasAuthority('admin:hospitals:read')")
    public ResponseEntity<ApiResponse<AdminHospitalResponse>> getHospital(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminHospitalService.getHospital(principal.getTenantId(), hospitalId)));
    }

    @PatchMapping("/{hospitalId}/status")
    @PreAuthorize("hasAuthority('admin:hospitals:write')")
    public ResponseEntity<ApiResponse<AdminHospitalResponse>> updateHospitalStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID hospitalId,
            @Valid @RequestBody UpdateHospitalStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminHospitalService.updateHospitalStatus(
                        principal.getTenantId(), principal.getUserId(), hospitalId, request)));
    }

    @PostMapping("/{hospitalId}/doctors/invite")
    @PreAuthorize("hasAuthority('admin:hospitals:write')")
    public ResponseEntity<ApiResponse<InviteDoctorResponse>> inviteDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID hospitalId,
            @Valid @RequestBody InviteDoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                doctorInviteService.inviteDoctor(
                        hospitalId, principal.getTenantId(), principal.getUserId(), request)));
    }
}
