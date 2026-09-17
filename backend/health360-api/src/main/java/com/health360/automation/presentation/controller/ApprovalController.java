package com.health360.automation.presentation.controller;

import com.health360.automation.application.service.ApprovalService;
import com.health360.automation.presentation.dto.request.DecideApprovalRequest;
import com.health360.automation.presentation.dto.response.ApprovalRequestResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping
    @PreAuthorize("hasAuthority('approvals:read')")
    public ResponseEntity<ApiResponse<Page<ApprovalRequestResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                approvalService.list(principal, hospitalId, status, pageable)));
    }

    @PostMapping("/{approvalId}/decide")
    @PreAuthorize("hasAuthority('approvals:write')")
    public ResponseEntity<ApiResponse<ApprovalRequestResponse>> decide(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID approvalId,
            @Valid @RequestBody DecideApprovalRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                approvalService.decide(principal, approvalId, request)));
    }
}
