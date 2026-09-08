package com.health360.ipd.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.ipd.application.service.IpdPostDischargeService;
import com.health360.ipd.presentation.dto.response.PatientIpdStayResponse;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientIpdPortalController {

    private final IpdPostDischargeService postDischargeService;

    @GetMapping("/me/ipd-stays")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<List<PatientIpdStayResponse>>> listMyIpdStays(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(postDischargeService.listMyIpdStays(principal)));
    }

    @GetMapping("/me/ipd-stays/{admissionId}")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<PatientIpdStayResponse>> getMyIpdStay(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(postDischargeService.getMyIpdStay(principal, admissionId)));
    }
}
