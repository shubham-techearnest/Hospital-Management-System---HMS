package com.health360.doctor.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.doctor.application.service.AdminDoctorVerificationService;
import com.health360.doctor.presentation.dto.request.RejectVerificationRequest;
import com.health360.doctor.presentation.dto.response.PendingVerificationResponse;
import com.health360.doctor.presentation.dto.response.VerificationReviewResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/doctors")
@RequiredArgsConstructor
public class AdminDoctorVerificationController {

    private final AdminDoctorVerificationService adminDoctorVerificationService;

    @GetMapping("/verifications")
    @PreAuthorize("hasAuthority('admin:doctor:verify')")
    public ResponseEntity<ApiResponse<Page<PendingVerificationResponse>>> listVerifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "PENDING_VERIFICATION") String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminDoctorVerificationService.listPending(
                        principal.getTenantId(), status, pageable)));
    }

    @GetMapping("/{doctorId}/verification-review")
    @PreAuthorize("hasAuthority('admin:doctor:verify')")
    public ResponseEntity<ApiResponse<VerificationReviewResponse>> getVerificationReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminDoctorVerificationService.getReviewDetail(principal.getTenantId(), doctorId)));
    }

    @GetMapping("/{doctorId}/verification-documents/{documentId}/content")
    @PreAuthorize("hasAuthority('admin:doctor:verify')")
    public ResponseEntity<Resource> downloadVerificationDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID doctorId,
            @PathVariable UUID documentId) {
        AdminDoctorVerificationService.DocumentContent content = adminDoctorVerificationService
                .getDocumentContent(principal.getTenantId(), doctorId, documentId);
        return ResponseEntity.ok()
                .contentType(content.contentType())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + content.fileName() + "\"")
                .body(content.resource());
    }

    @PostMapping("/{doctorId}/verify/approve")
    @PreAuthorize("hasAuthority('admin:doctor:verify')")
    public ResponseEntity<ApiResponse<VerificationReviewResponse>> approveVerification(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminDoctorVerificationService.approve(
                        principal.getTenantId(), principal.getUserId(), doctorId)));
    }

    @PostMapping("/{doctorId}/verify/reject")
    @PreAuthorize("hasAuthority('admin:doctor:verify')")
    public ResponseEntity<ApiResponse<VerificationReviewResponse>> rejectVerification(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID doctorId,
            @Valid @RequestBody RejectVerificationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminDoctorVerificationService.reject(
                        principal.getTenantId(), principal.getUserId(), doctorId, request)));
    }
}
