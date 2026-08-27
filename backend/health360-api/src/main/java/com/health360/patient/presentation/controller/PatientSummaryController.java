package com.health360.patient.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.patient.application.service.PatientSummaryService;
import com.health360.patient.presentation.dto.response.PatientSummaryResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.dto.ApiResponse;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    @PreAuthorize("hasAuthority('patient:summary:read') or hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<PatientSummaryResponse>> getPatientSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID patientId,
            @RequestParam(required = false) UUID appointmentId,
            @RequestParam(required = false) UUID encounterId) {
        if (encounterId != null) {
            return ResponseEntity.ok(ApiResponse.ok(
                    patientSummaryService.getSummaryForEncounter(principal, patientId, encounterId)));
        }
        if (appointmentId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Provide appointmentId or encounterId");
        }
        return ResponseEntity.ok(ApiResponse.ok(
                patientSummaryService.getSummary(
                        principal.getUserId(), principal.getTenantId(), patientId, appointmentId)));
    }
}
