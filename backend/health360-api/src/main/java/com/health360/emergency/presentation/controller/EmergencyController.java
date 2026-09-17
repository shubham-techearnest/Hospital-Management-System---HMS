package com.health360.emergency.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.emergency.application.service.EmergencyService;
import com.health360.emergency.presentation.dto.request.CreateEdVisitRequest;
import com.health360.emergency.presentation.dto.request.DisposeEdVisitRequest;
import com.health360.emergency.presentation.dto.request.TriageEdVisitRequest;
import com.health360.emergency.presentation.dto.response.EdVisitResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/emergency")
@RequiredArgsConstructor
public class EmergencyController {

    private final EmergencyService emergencyService;

    @PostMapping("/visits")
    @PreAuthorize("hasAuthority('emergency:write')")
    public ResponseEntity<ApiResponse<EdVisitResponse>> registerArrival(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateEdVisitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(emergencyService.registerArrival(principal, request)));
    }

    @GetMapping("/visits")
    @PreAuthorize("hasAuthority('emergency:read')")
    public ResponseEntity<ApiResponse<Page<EdVisitResponse>>> listBoard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(defaultValue = "true") boolean activeOnly,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                emergencyService.listBoard(principal, hospitalId, branchId, activeOnly, pageable)));
    }

    @PostMapping("/visits/{visitId}/triage")
    @PreAuthorize("hasAuthority('emergency:write')")
    public ResponseEntity<ApiResponse<EdVisitResponse>> triage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID visitId,
            @Valid @RequestBody TriageEdVisitRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(emergencyService.triage(principal, visitId, request)));
    }

    @PostMapping("/visits/{visitId}/disposition")
    @PreAuthorize("hasAuthority('emergency:disposition')")
    public ResponseEntity<ApiResponse<EdVisitResponse>> dispose(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID visitId,
            @Valid @RequestBody DisposeEdVisitRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(emergencyService.dispose(principal, visitId, request)));
    }
}
