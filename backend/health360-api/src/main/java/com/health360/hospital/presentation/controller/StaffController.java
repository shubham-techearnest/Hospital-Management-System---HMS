package com.health360.hospital.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.StaffService;
import com.health360.hospital.presentation.dto.request.InviteStaffRequest;
import com.health360.hospital.presentation.dto.response.StaffResponse;
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
@RequestMapping("/api/v1/hospital/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PostMapping("/invite")
    @PreAuthorize("hasAuthority('staff:invite')")
    public ResponseEntity<ApiResponse<StaffResponse>> inviteStaff(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InviteStaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                staffService.inviteStaff(principal, request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('staff:read')")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> listStaff(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(
                staffService.listStaff(principal, hospitalId)));
    }

    @PostMapping("/{staffId}/deactivate")
    @PreAuthorize("hasAuthority('staff:write')")
    public ResponseEntity<ApiResponse<StaffResponse>> deactivateStaff(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID staffId) {
        return ResponseEntity.ok(ApiResponse.ok(
                staffService.deactivateStaff(principal, staffId)));
    }
}
