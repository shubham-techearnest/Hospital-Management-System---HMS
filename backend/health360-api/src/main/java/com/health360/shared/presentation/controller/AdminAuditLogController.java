package com.health360.shared.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.shared.application.AdminAuditLogService;
import com.health360.shared.dto.ApiResponse;
import com.health360.shared.presentation.dto.response.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
public class AdminAuditLogController {

    private final AdminAuditLogService adminAuditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('audit:view')")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> listAuditLogs(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @PageableDefault(size = 50, sort = "occurredAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminAuditLogService.listAuditLogs(
                        principal.getTenantId(), action, entityType, entityId, pageable)));
    }
}
