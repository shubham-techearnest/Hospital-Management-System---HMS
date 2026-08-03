package com.health360.iam.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.application.service.AdminUserService;
import com.health360.iam.presentation.dto.request.UpdateUserStatusRequest;
import com.health360.iam.presentation.dto.response.AdminUserResponse;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @PreAuthorize("hasAuthority('admin:users:read')")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> listUsers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminUserService.searchUsers(
                        principal.getTenantId(), email, name, role, status, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('admin:users:read')")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminUserService.getUser(principal.getTenantId(), id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('admin:users:write')")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminUserService.updateUserStatus(
                        principal.getTenantId(), principal.getUserId(), id, request)));
    }
}
