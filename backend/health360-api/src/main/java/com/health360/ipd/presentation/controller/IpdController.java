package com.health360.ipd.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.ipd.application.service.IpdAdmissionService;
import com.health360.ipd.application.service.IpdFacilityService;
import com.health360.ipd.presentation.dto.request.*;
import com.health360.ipd.presentation.dto.response.*;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ipd")
@RequiredArgsConstructor
public class IpdController {

    private final IpdFacilityService facilityService;
    private final IpdAdmissionService admissionService;

    @PostMapping("/wards")
    @PreAuthorize("hasAuthority('ipd:ward:write')")
    public ResponseEntity<ApiResponse<IpdWardResponse>> createWard(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIpdWardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                facilityService.createWard(principal, request)));
    }

    @GetMapping("/wards")
    @PreAuthorize("hasAuthority('ipd:ward:read')")
    public ResponseEntity<ApiResponse<List<IpdWardResponse>>> listWards(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                facilityService.listWards(principal, hospitalId, branchId)));
    }

    @PostMapping("/rooms")
    @PreAuthorize("hasAuthority('ipd:ward:write')")
    public ResponseEntity<ApiResponse<IpdRoomResponse>> createRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIpdRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                facilityService.createRoom(principal, request)));
    }

    @GetMapping("/rooms")
    @PreAuthorize("hasAuthority('ipd:ward:read')")
    public ResponseEntity<ApiResponse<List<IpdRoomResponse>>> listRooms(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID wardId) {
        return ResponseEntity.ok(ApiResponse.ok(facilityService.listRooms(principal, wardId)));
    }

    @PostMapping("/beds")
    @PreAuthorize("hasAuthority('ipd:bed:write')")
    public ResponseEntity<ApiResponse<IpdBedResponse>> createBed(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIpdBedRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                facilityService.createBed(principal, request)));
    }

    @GetMapping("/beds")
    @PreAuthorize("hasAuthority('ipd:bed:read')")
    public ResponseEntity<ApiResponse<List<IpdBedResponse>>> listBeds(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(
                facilityService.listBeds(principal, hospitalId, branchId, status)));
    }

    @PostMapping("/admissions")
    @PreAuthorize("hasAuthority('ipd:admission:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> admitPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIpdAdmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                admissionService.admitPatient(principal, request)));
    }

    @GetMapping("/admissions")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<Page<IpdAdmissionResponse>>> listAdmissions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                admissionService.listAdmissions(principal, hospitalId, branchId, status, pageable)));
    }

    @GetMapping("/admissions/{admissionId}")
    @PreAuthorize("hasAuthority('ipd:admission:read')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> getAdmission(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(admissionService.getAdmission(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/rounds")
    @PreAuthorize("hasAuthority('ipd:round:write')")
    public ResponseEntity<ApiResponse<IpdRoundResponse>> addRound(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody CreateIpdRoundRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                admissionService.addRound(principal, admissionId, request)));
    }

    @GetMapping("/admissions/{admissionId}/rounds")
    @PreAuthorize("hasAuthority('ipd:round:read')")
    public ResponseEntity<ApiResponse<List<IpdRoundResponse>>> listRounds(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId) {
        return ResponseEntity.ok(ApiResponse.ok(admissionService.listRounds(principal, admissionId)));
    }

    @PostMapping("/admissions/{admissionId}/discharge")
    @PreAuthorize("hasAuthority('ipd:discharge:write')")
    public ResponseEntity<ApiResponse<IpdDischargeResponse>> dischargePatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody DischargeIpdPatientRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                admissionService.dischargePatient(principal, admissionId, request)));
    }
}
