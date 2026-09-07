package com.health360.org.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.org.application.service.PartnerAdminService;
import com.health360.org.presentation.dto.request.AddPartnerMembershipRequest;
import com.health360.org.presentation.dto.request.CreatePartnerLocationRequest;
import com.health360.org.presentation.dto.request.CreatePartnerOrgRequest;
import com.health360.org.presentation.dto.request.LinkHospitalPartnerRequest;
import com.health360.org.presentation.dto.request.UpdatePartnerMembershipRequest;
import com.health360.org.presentation.dto.request.UpdatePartnerOrgRequest;
import com.health360.org.presentation.dto.response.HospitalPartnerLinkResponse;
import com.health360.org.presentation.dto.response.PartnerLocationResponse;
import com.health360.org.presentation.dto.response.PartnerMembershipResponse;
import com.health360.org.presentation.dto.response.PartnerOrgResponse;
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
@RequestMapping("/api/v1/admin/partners")
@RequiredArgsConstructor
public class AdminPartnerController {

    private final PartnerAdminService partnerAdminService;

    @GetMapping
    @PreAuthorize("hasAuthority('partner:org:read')")
    public ResponseEntity<ApiResponse<List<PartnerOrgResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String orgType) {
        return ResponseEntity.ok(ApiResponse.ok(partnerAdminService.list(principal, orgType)));
    }

    @GetMapping("/{partnerOrgId}")
    @PreAuthorize("hasAuthority('partner:org:read')")
    public ResponseEntity<ApiResponse<PartnerOrgResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID partnerOrgId) {
        return ResponseEntity.ok(ApiResponse.ok(partnerAdminService.get(principal, partnerOrgId)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('partner:org:write')")
    public ResponseEntity<ApiResponse<PartnerOrgResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePartnerOrgRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                partnerAdminService.create(principal, request)));
    }

    @PatchMapping("/{partnerOrgId}")
    @PreAuthorize("hasAuthority('partner:org:write')")
    public ResponseEntity<ApiResponse<PartnerOrgResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID partnerOrgId,
            @Valid @RequestBody UpdatePartnerOrgRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                partnerAdminService.update(principal, partnerOrgId, request)));
    }

    @PostMapping("/{partnerOrgId}/locations")
    @PreAuthorize("hasAuthority('partner:org:write')")
    public ResponseEntity<ApiResponse<PartnerLocationResponse>> addLocation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID partnerOrgId,
            @Valid @RequestBody CreatePartnerLocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                partnerAdminService.addLocation(principal, partnerOrgId, request)));
    }

    @PostMapping("/{partnerOrgId}/hospital-links")
    @PreAuthorize("hasAuthority('partner:org:write')")
    public ResponseEntity<ApiResponse<HospitalPartnerLinkResponse>> linkHospital(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID partnerOrgId,
            @Valid @RequestBody LinkHospitalPartnerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                partnerAdminService.linkHospital(principal, partnerOrgId, request)));
    }

    @GetMapping("/{partnerOrgId}/hospital-links")
    @PreAuthorize("hasAuthority('partner:org:read')")
    public ResponseEntity<ApiResponse<List<HospitalPartnerLinkResponse>>> listLinks(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID partnerOrgId) {
        return ResponseEntity.ok(ApiResponse.ok(
                partnerAdminService.listLinks(principal, partnerOrgId)));
    }

    @GetMapping("/{partnerOrgId}/memberships")
    @PreAuthorize("hasAuthority('partner:org:read')")
    public ResponseEntity<ApiResponse<List<PartnerMembershipResponse>>> listMemberships(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID partnerOrgId) {
        return ResponseEntity.ok(ApiResponse.ok(
                partnerAdminService.listMemberships(principal, partnerOrgId)));
    }

    @PostMapping("/{partnerOrgId}/memberships")
    @PreAuthorize("hasAuthority('partner:org:write')")
    public ResponseEntity<ApiResponse<PartnerMembershipResponse>> addMembership(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID partnerOrgId,
            @Valid @RequestBody AddPartnerMembershipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                partnerAdminService.addMembership(principal, partnerOrgId, request)));
    }

    @PatchMapping("/{partnerOrgId}/memberships/{membershipId}")
    @PreAuthorize("hasAuthority('partner:org:write')")
    public ResponseEntity<ApiResponse<PartnerMembershipResponse>> updateMembership(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID partnerOrgId,
            @PathVariable UUID membershipId,
            @Valid @RequestBody UpdatePartnerMembershipRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                partnerAdminService.updateMembership(principal, partnerOrgId, membershipId, request)));
    }
}
