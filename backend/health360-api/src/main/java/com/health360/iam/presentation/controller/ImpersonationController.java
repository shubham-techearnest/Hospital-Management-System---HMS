package com.health360.iam.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.application.service.ImpersonationService;
import com.health360.iam.presentation.dto.request.StartImpersonationRequest;
import com.health360.iam.presentation.dto.response.ImpersonationCapabilityResponse;
import com.health360.iam.presentation.dto.response.ImpersonationContextResponse;
import com.health360.iam.presentation.dto.response.ImpersonationStartResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/impersonation")
@RequiredArgsConstructor
public class ImpersonationController {

    private final ImpersonationService impersonationService;

    @GetMapping("/capability")
    @PreAuthorize("hasAuthority('admin:users:read') or hasAuthority('admin:users:impersonate')")
    public ResponseEntity<ApiResponse<ImpersonationCapabilityResponse>> capability() {
        return ResponseEntity.ok(ApiResponse.ok(impersonationService.capability()));
    }

    @PostMapping("/start")
    @PreAuthorize("hasAuthority('admin:users:impersonate') or hasAuthority('admin:users:write')")
    public ResponseEntity<ApiResponse<ImpersonationStartResponse>> start(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StartImpersonationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                impersonationService.start(principal, request.getTargetUserId(), request.getReason())));
    }

    @PostMapping("/end")
    public ResponseEntity<ApiResponse<Map<String, Object>>> end(
            @AuthenticationPrincipal UserPrincipal principal) {
        impersonationService.end(principal, "EXITED");
        return ResponseEntity.ok(ApiResponse.ok(Map.of("ended", true)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<ImpersonationContextResponse>> active(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(impersonationService.activeContext(principal)));
    }
}
