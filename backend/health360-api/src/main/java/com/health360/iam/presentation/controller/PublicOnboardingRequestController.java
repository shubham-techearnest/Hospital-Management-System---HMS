package com.health360.iam.presentation.controller;

import com.health360.iam.application.service.OnboardingRequestService;
import com.health360.iam.presentation.dto.request.CreateOnboardingRequestRequest;
import com.health360.iam.presentation.dto.response.OnboardingRequestResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/onboarding-requests")
@RequiredArgsConstructor
public class PublicOnboardingRequestController {

    private final OnboardingRequestService onboardingRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<OnboardingRequestResponse>> submit(
            @Valid @RequestBody CreateOnboardingRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(onboardingRequestService.submit(request)));
    }
}
