package com.health360.iam.presentation.controller;

import com.health360.config.Health360Properties;
import com.health360.config.security.UserPrincipal;
import com.health360.iam.application.service.AuthenticationService;
import com.health360.iam.application.service.EmailVerificationService;
import com.health360.iam.application.service.PasswordChangeService;
import com.health360.iam.application.service.RegistrationService;
import com.health360.iam.presentation.dto.request.ChangePasswordRequest;
import com.health360.iam.presentation.dto.request.LoginRequest;
import com.health360.iam.presentation.dto.request.RefreshTokenRequest;
import com.health360.iam.presentation.dto.request.RegisterRequest;
import com.health360.iam.presentation.dto.request.ResendVerificationRequest;
import com.health360.patient.application.service.PatientPortalInviteService;
import com.health360.patient.presentation.dto.request.CompletePortalAccountRequest;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegistrationService registrationService;
    private final AuthenticationService authenticationService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordChangeService passwordChangeService;
    private final Health360Properties properties;
    private final PatientPortalInviteService patientPortalInviteService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(registrationService.register(request)));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.message("Email verified successfully. You can now log in."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        emailVerificationService.resendVerification(request.getEmail(), properties.getDefaultTenantId());
        return ResponseEntity.ok(ApiResponse.message("Verification email sent"));
    }

    @PostMapping("/complete-patient-account")
    public ResponseEntity<ApiResponse<Void>> completePatientAccount(
            @Valid @RequestBody CompletePortalAccountRequest request) {
        patientPortalInviteService.completeAccount(request);
        return ResponseEntity.ok(ApiResponse.message(
                "Account activated. You can now log in with your email and password."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authenticationService.login(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<?>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authenticationService.refresh(request.getRefreshToken())));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Refresh-Token", required = false) String refreshToken) {
        long remainingTtl = properties.getJwt().getAccessTokenTtlSeconds();
        authenticationService.logout(
                principal.getUserId(),
                principal.getJti(),
                remainingTtl,
                refreshToken);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        passwordChangeService.changePassword(
                principal.getUserId(),
                principal.getTenantId(),
                principal.getJti(),
                properties.getJwt().getAccessTokenTtlSeconds(),
                request);
        return ResponseEntity.ok(ApiResponse.message("Password changed successfully. Please sign in again."));
    }
}
