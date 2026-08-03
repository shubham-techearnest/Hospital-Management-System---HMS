package com.health360.patient.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.patient.application.service.PatientSummaryService;
import com.health360.patient.presentation.dto.response.PatientSummaryResponse;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientSummaryController {

    private final PatientSummaryService patientSummaryService;

    @GetMapping("/{patientId}/summary")
    @PreAuthorize("hasAuthority('patient:summary:read')")
    public ResponseEntity<ApiResponse<PatientSummaryResponse>> getPatientSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID patientId,
            @RequestParam UUID appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientSummaryService.getSummary(
                        principal.getUserId(), principal.getTenantId(), patientId, appointmentId)));
    }
}
