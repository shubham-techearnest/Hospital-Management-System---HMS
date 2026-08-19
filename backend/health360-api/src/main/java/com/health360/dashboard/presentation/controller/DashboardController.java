package com.health360.dashboard.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.dashboard.application.service.DashboardService;
import com.health360.dashboard.presentation.dto.response.*;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/api/v1/hospital/dashboard")
    @PreAuthorize("hasAuthority('hospital:profile:read')")
    public ResponseEntity<ApiResponse<HospitalDashboardResponse>> getHospitalDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getHospitalDashboard(principal, hospitalId, branchId)));
    }

    @GetMapping("/api/v1/opd/dashboard")
    @PreAuthorize("hasAuthority('opd:queue:read')")
    public ResponseEntity<ApiResponse<OpdDashboardResponse>> getOpdDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getOpdDashboard(principal, hospitalId, branchId)));
    }

    @GetMapping("/api/v1/ipd/dashboard")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<IpdDashboardResponse>> getIpdDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getIpdDashboard(principal, hospitalId, branchId)));
    }

    @GetMapping("/api/v1/icu/dashboard")
    @PreAuthorize("hasAuthority('icu:stay:read')")
    public ResponseEntity<ApiResponse<IcuDashboardResponse>> getIcuDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getIcuDashboard(principal, hospitalId, branchId)));
    }

    @GetMapping("/api/v1/lab/dashboard")
    @PreAuthorize("hasAuthority('lab:order:read')")
    public ResponseEntity<ApiResponse<ModuleWorklistDashboardResponse>> getLabDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getLabDashboard(principal, hospitalId, branchId)));
    }

    @GetMapping("/api/v1/radiology/dashboard")
    @PreAuthorize("hasAuthority('radiology:order:read')")
    public ResponseEntity<ApiResponse<ModuleWorklistDashboardResponse>> getRadiologyDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getRadiologyDashboard(principal, hospitalId, branchId)));
    }

    @GetMapping("/api/v1/pharmacy/dashboard")
    @PreAuthorize("hasAuthority('pharmacy:medication:read')")
    public ResponseEntity<ApiResponse<ModuleWorklistDashboardResponse>> getPharmacyDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getPharmacyDashboard(principal, hospitalId, branchId)));
    }

    @GetMapping("/api/v1/ot/dashboard")
    @PreAuthorize("hasAuthority('ot:procedure:read')")
    public ResponseEntity<ApiResponse<ModuleWorklistDashboardResponse>> getOtDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getOtDashboard(principal, hospitalId, branchId)));
    }

    @GetMapping("/api/v1/doctor/dashboard")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<DoctorDashboardResponse>> getDoctorDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getDoctorDashboard(principal)));
    }

    @GetMapping("/api/v1/patient/dashboard/clinical")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<PatientClinicalDashboardResponse>> getPatientClinicalDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getPatientClinicalDashboard(principal)));
    }
}
