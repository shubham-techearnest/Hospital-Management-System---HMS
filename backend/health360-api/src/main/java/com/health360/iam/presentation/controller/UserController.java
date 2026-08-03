package com.health360.iam.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.application.service.NotificationPreferenceService;
import com.health360.iam.application.service.UserAccountService;
import com.health360.iam.presentation.dto.request.NotificationPreferenceItemRequest;
import com.health360.iam.presentation.dto.request.UpdateUserProfileRequest;
import com.health360.iam.presentation.dto.response.NotificationPreferenceResponse;
import com.health360.iam.presentation.dto.response.UserProfileResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserAccountService userAccountService;
    private final NotificationPreferenceService notificationPreferenceService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                userAccountService.getCurrentUser(principal.getUserId(), principal.getTenantId())));
    }

    @PatchMapping("/me")
    @PreAuthorize("hasAuthority('user:write')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                userAccountService.updateCurrentUser(principal.getUserId(), principal.getTenantId(), request)));
    }

    @GetMapping("/me/notification-preferences")
    public ResponseEntity<ApiResponse<List<NotificationPreferenceResponse>>> getNotificationPreferences(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                notificationPreferenceService.getPreferences(principal.getUserId(), principal.getTenantId())));
    }

    @PutMapping("/me/notification-preferences")
    public ResponseEntity<ApiResponse<List<NotificationPreferenceResponse>>> updateNotificationPreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody List<@Valid NotificationPreferenceItemRequest> request) {
        return ResponseEntity.ok(ApiResponse.ok(
                notificationPreferenceService.updatePreferences(
                        principal.getUserId(), principal.getTenantId(), request)));
    }
}
