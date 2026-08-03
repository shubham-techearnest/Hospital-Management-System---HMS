package com.health360.doctor.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.doctor.application.service.DoctorProfileService;
import com.health360.doctor.application.service.DoctorVerificationService;
import com.health360.doctor.presentation.dto.request.*;
import com.health360.doctor.presentation.dto.response.*;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorProfileController {

    private final DoctorProfileService doctorProfileService;
    private final DoctorVerificationService doctorVerificationService;

    @GetMapping("/me/profile")
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.getProfile(principal.getUserId(), principal.getTenantId())));
    }

    @PutMapping("/me/profile/professional-details")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateProfessionalDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfessionalDetailsRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.updateProfessionalDetails(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @GetMapping("/me/profile/qualifications")
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<List<QualificationResponse>>> listQualifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.getProfile(principal.getUserId(), principal.getTenantId())
                        .getQualifications()));
    }

    @PostMapping("/me/profile/qualifications")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<QualificationResponse>> createQualification(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody QualificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                doctorProfileService.createQualification(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/qualifications/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<QualificationResponse>> updateQualification(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody QualificationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.updateQualification(
                        principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/qualifications/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteQualification(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        doctorProfileService.deleteQualification(
                principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.message("Qualification deleted"));
    }

    @GetMapping("/me/profile/experience")
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<List<ExperienceResponse>>> listExperience(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.getProfile(principal.getUserId(), principal.getTenantId())
                        .getExperience()));
    }

    @PostMapping("/me/profile/experience")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<ExperienceResponse>> createExperience(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                doctorProfileService.createExperience(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/experience/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<ExperienceResponse>> updateExperience(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.updateExperience(
                        principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/experience/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        doctorProfileService.deleteExperience(
                principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.message("Experience entry deleted"));
    }

    @PutMapping("/me/profile/specialization")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateSpecialization(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateSpecializationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.updateSpecialization(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/consultation-defaults")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateConsultationDefaults(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateConsultationDefaultsRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.updateConsultationDefaults(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/biography")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateBiography(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateBiographyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.updateBiography(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @GetMapping("/me/profile/awards")
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<List<AwardResponse>>> listAwards(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.listAwards(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile/awards")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<AwardResponse>> createAward(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AwardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                doctorProfileService.createAward(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/awards/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<AwardResponse>> updateAward(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AwardRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.updateAward(
                        principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/awards/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteAward(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        doctorProfileService.deleteAward(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.message("Award deleted"));
    }

    @GetMapping("/me/profile/memberships")
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<List<MembershipResponse>>> listMemberships(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.listMemberships(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile/memberships")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<MembershipResponse>> createMembership(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MembershipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                doctorProfileService.createMembership(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/memberships/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<MembershipResponse>> updateMembership(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody MembershipRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorProfileService.updateMembership(
                        principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/memberships/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteMembership(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        doctorProfileService.deleteMembership(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.message("Membership deleted"));
    }

    @GetMapping("/specializations")
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<List<SpecializationResponse>>> listSpecializations() {
        return ResponseEntity.ok(ApiResponse.ok(doctorProfileService.listSpecializations()));
    }

    @PostMapping("/me/profile/languages")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> addLanguage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorVerificationService.addLanguage(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @DeleteMapping("/me/profile/languages/{languageCode}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> removeLanguage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String languageCode) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorVerificationService.removeLanguage(
                        principal.getUserId(), principal.getTenantId(), languageCode)));
    }

    @GetMapping("/me/profile/verification-documents")
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<List<VerificationDocumentResponse>>> listVerificationDocuments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorVerificationService.listDocuments(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping(value = "/me/profile/verification-documents", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<VerificationDocumentResponse>> uploadVerificationDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                doctorVerificationService.uploadDocument(
                        principal.getUserId(), principal.getTenantId(), documentType, file)));
    }

    @DeleteMapping("/me/profile/verification-documents/{id}")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteVerificationDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        doctorVerificationService.deleteDocument(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.message("Verification document deleted"));
    }

    @PostMapping("/me/profile/submit-verification")
    @PreAuthorize("hasAuthority('doctor:profile:write')")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> submitForVerification(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorVerificationService.submitForVerification(
                        principal.getUserId(), principal.getTenantId())));
    }
}
