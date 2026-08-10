package com.health360.hospital.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.doctor.presentation.dto.request.InviteDoctorRequest;
import com.health360.doctor.presentation.dto.response.InviteDoctorResponse;
import com.health360.hospital.application.service.HospitalService;
import com.health360.hospital.presentation.dto.request.*;
import com.health360.hospital.presentation.dto.response.*;
import com.health360.shared.dto.ApiResponse;
import com.health360.subscription.application.service.HospitalSubscriptionQueryService;
import com.health360.subscription.presentation.dto.response.HospitalSubscriptionResponse;
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
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;
    private final HospitalSubscriptionQueryService hospitalSubscriptionQueryService;

    @GetMapping("/me/subscription")
    @PreAuthorize("hasAuthority('hospital:subscription:read')")
    public ResponseEntity<ApiResponse<HospitalSubscriptionResponse>> getSubscription(
            @AuthenticationPrincipal UserPrincipal principal) {
        var profile = hospitalService.getProfile(principal.getUserId(), principal.getTenantId());
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalSubscriptionQueryService.getHospitalSubscriptionSummary(
                        profile.getId(), principal.getTenantId())));
    }

    @GetMapping("/me/profile")
    @PreAuthorize("hasAuthority('hospital:profile:read')")
    public ResponseEntity<ApiResponse<HospitalProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.getProfile(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<HospitalProfileResponse>> createProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateHospitalProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                hospitalService.createProfile(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<HospitalProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateHospitalProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.updateProfile(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/emergency-info")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<HospitalProfileResponse>> updateEmergencyInfo(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateEmergencyInfoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.updateEmergencyInfo(principal.getUserId(), principal.getTenantId(), request)));
    }

    @GetMapping("/me/branches")
    @PreAuthorize("hasAuthority('hospital:profile:read')")
    public ResponseEntity<ApiResponse<List<BranchResponse>>> listBranches(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.listBranches(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/branches")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<BranchResponse>> createBranch(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BranchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                hospitalService.createBranch(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/branches/{branchId}")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<BranchResponse>> updateBranch(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID branchId,
            @Valid @RequestBody BranchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.updateBranch(principal.getUserId(), principal.getTenantId(), branchId, request)));
    }

    @DeleteMapping("/me/branches/{branchId}")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteBranch(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID branchId) {
        hospitalService.deleteBranch(principal.getUserId(), principal.getTenantId(), branchId);
        return ResponseEntity.ok(ApiResponse.message("Branch deleted"));
    }

    @GetMapping("/me/departments")
    @PreAuthorize("hasAuthority('hospital:profile:read')")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> listDepartments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.listDepartments(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/departments")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                hospitalService.createDepartment(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/departments/{departmentId}")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID departmentId,
            @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.updateDepartment(principal.getUserId(), principal.getTenantId(), departmentId, request)));
    }

    @DeleteMapping("/me/departments/{departmentId}")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID departmentId) {
        hospitalService.deleteDepartment(principal.getUserId(), principal.getTenantId(), departmentId);
        return ResponseEntity.ok(ApiResponse.message("Department deleted"));
    }

    @GetMapping("/me/facilities")
    @PreAuthorize("hasAuthority('hospital:profile:read')")
    public ResponseEntity<ApiResponse<List<FacilityResponse>>> listFacilities(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.listFacilities(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/facilities")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<FacilityResponse>> createFacility(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FacilityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                hospitalService.createFacility(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/facilities/{facilityId}")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<FacilityResponse>> updateFacility(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID facilityId,
            @Valid @RequestBody FacilityRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.updateFacility(
                        principal.getUserId(), principal.getTenantId(), facilityId, request)));
    }

    @DeleteMapping("/me/facilities/{facilityId}")
    @PreAuthorize("hasAuthority('hospital:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID facilityId) {
        hospitalService.deleteFacility(principal.getUserId(), principal.getTenantId(), facilityId);
        return ResponseEntity.ok(ApiResponse.message("Facility deleted"));
    }

    @GetMapping("/me/doctors")
    @PreAuthorize("hasAuthority('hospital:doctors:read')")
    public ResponseEntity<ApiResponse<List<HospitalDoctorResponse>>> listDoctors(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.listDoctors(principal.getUserId(), principal.getTenantId())));
    }

    @GetMapping("/me/doctors/search")
    @PreAuthorize("hasAuthority('hospital:doctors:write')")
    public ResponseEntity<ApiResponse<List<DoctorSearchResultResponse>>> searchDoctors(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.searchDoctors(principal.getUserId(), principal.getTenantId(), q)));
    }

    @PostMapping("/me/doctors/invite")
    @PreAuthorize("hasAuthority('hospital:doctors:write')")
    public ResponseEntity<ApiResponse<InviteDoctorResponse>> inviteDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InviteDoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                hospitalService.inviteDoctor(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PostMapping("/me/doctors")
    @PreAuthorize("hasAuthority('hospital:doctors:write')")
    public ResponseEntity<ApiResponse<HospitalDoctorResponse>> associateDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AssociateDoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                hospitalService.associateDoctor(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PostMapping("/me/doctors/{associationId}/approve")
    @PreAuthorize("hasAuthority('hospital:doctors:write')")
    public ResponseEntity<ApiResponse<HospitalDoctorResponse>> approveDoctorAssociation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID associationId) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.approveDoctorAssociation(
                        principal.getUserId(), principal.getTenantId(), associationId)));
    }

    @DeleteMapping("/me/doctors/{associationId}")
    @PreAuthorize("hasAuthority('hospital:doctors:write')")
    public ResponseEntity<ApiResponse<Void>> removeDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID associationId) {
        hospitalService.removeDoctorAssociation(principal.getUserId(), principal.getTenantId(), associationId);
        return ResponseEntity.ok(ApiResponse.message("Doctor association removed"));
    }

    @GetMapping("/catalog")
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<List<HospitalProfileResponse>>> listHospitalCatalog(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.listHospitalsForDoctor(principal.getTenantId())));
    }
}
