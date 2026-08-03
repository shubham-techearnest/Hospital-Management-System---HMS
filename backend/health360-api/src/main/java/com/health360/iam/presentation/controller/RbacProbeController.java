package com.health360.iam.presentation.controller;

import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * RBAC probe endpoints for S2 verification. Real domain controllers replace these in later sprints.
 */
@RestController
@RequestMapping("/api/v1/rbac")
@RequiredArgsConstructor
public class RbacProbeController {

    @GetMapping("/patient-profile")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<Map<String, String>>> patientProfileProbe() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of("scope", "patient-profile")));
    }

    @GetMapping("/doctor-profile")
    @PreAuthorize("hasAuthority('doctor:profile:read')")
    public ResponseEntity<ApiResponse<Map<String, String>>> doctorProfileProbe() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of("scope", "doctor-profile")));
    }

    @GetMapping("/admin-users")
    @PreAuthorize("hasAuthority('admin:users:read')")
    public ResponseEntity<ApiResponse<Map<String, String>>> adminUsersProbe() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of("scope", "admin-users")));
    }
}
