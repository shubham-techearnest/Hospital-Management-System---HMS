package com.health360.predictive.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.predictive.application.service.PredictiveInsightService;
import com.health360.predictive.presentation.dto.response.PredictiveInsightResponse;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/predictive")
@RequiredArgsConstructor
public class PredictiveController {

    private final PredictiveInsightService predictiveInsightService;

    @PostMapping("/refresh")
    @PreAuthorize("hasAuthority('predictive:write')")
    public ResponseEntity<ApiResponse<List<PredictiveInsightResponse>>> refresh(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                predictiveInsightService.refresh(principal, hospitalId, branchId)));
    }

    @GetMapping("/insights")
    @PreAuthorize("hasAuthority('predictive:read') or hasAuthority('commandcenter:read')")
    public ResponseEntity<ApiResponse<List<PredictiveInsightResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                predictiveInsightService.listActive(principal, hospitalId, branchId)));
    }

    @PostMapping("/insights/{insightId}/acknowledge")
    @PreAuthorize("hasAuthority('predictive:write')")
    public ResponseEntity<ApiResponse<PredictiveInsightResponse>> acknowledge(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID insightId) {
        return ResponseEntity.ok(ApiResponse.ok(
                predictiveInsightService.acknowledge(principal, insightId)));
    }
}
