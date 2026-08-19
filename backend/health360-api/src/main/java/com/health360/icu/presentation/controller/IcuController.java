package com.health360.icu.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.icu.application.service.IcuEquipmentService;
import com.health360.icu.application.service.IcuFacilityService;
import com.health360.icu.application.service.IcuStayService;
import com.health360.icu.presentation.dto.request.*;
import com.health360.icu.presentation.dto.response.*;
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
@RequestMapping("/api/v1/icu")
@RequiredArgsConstructor
public class IcuController {

    private final IcuFacilityService facilityService;
    private final IcuStayService stayService;
    private final IcuEquipmentService equipmentService;

    @PostMapping("/units")
    @PreAuthorize("hasAuthority('icu:unit:write')")
    public ResponseEntity<ApiResponse<IcuUnitResponse>> createUnit(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIcuUnitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                facilityService.createUnit(principal, request)));
    }

    @GetMapping("/units")
    @PreAuthorize("hasAuthority('icu:unit:read')")
    public ResponseEntity<ApiResponse<List<IcuUnitResponse>>> listUnits(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                facilityService.listUnits(principal, hospitalId, branchId)));
    }

    @PostMapping("/beds")
    @PreAuthorize("hasAuthority('icu:unit:write')")
    public ResponseEntity<ApiResponse<IcuBedResponse>> createBed(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIcuBedRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                facilityService.createBed(principal, request)));
    }

    @GetMapping("/beds")
    @PreAuthorize("hasAuthority('icu:unit:read')")
    public ResponseEntity<ApiResponse<List<IcuBedResponse>>> listBeds(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(
                facilityService.listBeds(principal, hospitalId, branchId, status)));
    }

    @PostMapping("/stays")
    @PreAuthorize("hasAuthority('icu:stay:write')")
    public ResponseEntity<ApiResponse<IcuStayResponse>> admitToIcu(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIcuStayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                stayService.admitToIcu(principal, request)));
    }

    @GetMapping("/stays")
    @PreAuthorize("hasAuthority('icu:stay:read')")
    public ResponseEntity<ApiResponse<Page<IcuStayResponse>>> listStays(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                stayService.listStays(principal, hospitalId, branchId, status, pageable)));
    }

    @GetMapping("/stays/{stayId}")
    @PreAuthorize("hasAuthority('icu:stay:read')")
    public ResponseEntity<ApiResponse<IcuStayResponse>> getStay(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID stayId) {
        return ResponseEntity.ok(ApiResponse.ok(stayService.getStay(principal, stayId)));
    }

    @PostMapping("/stays/{stayId}/discharge")
    @PreAuthorize("hasAuthority('icu:stay:write')")
    public ResponseEntity<ApiResponse<IcuDischargeResponse>> dischargeFromIcu(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID stayId,
            @Valid @RequestBody DischargeIcuStayRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                stayService.dischargeFromIcu(principal, stayId, request)));
    }

    @PostMapping("/stays/{stayId}/monitoring-records")
    @PreAuthorize("hasAuthority('icu:monitoring:write')")
    public ResponseEntity<ApiResponse<IcuMonitoringRecordResponse>> addMonitoringRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID stayId,
            @Valid @RequestBody CreateIcuMonitoringRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                stayService.addMonitoringRecord(principal, stayId, request)));
    }

    @GetMapping("/stays/{stayId}/monitoring-records")
    @PreAuthorize("hasAuthority('icu:monitoring:read')")
    public ResponseEntity<ApiResponse<List<IcuMonitoringRecordResponse>>> listMonitoringRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID stayId) {
        return ResponseEntity.ok(ApiResponse.ok(
                stayService.listMonitoringRecords(principal, stayId)));
    }

    @PostMapping("/equipment")
    @PreAuthorize("hasAuthority('icu:equipment:write')")
    public ResponseEntity<ApiResponse<IcuEquipmentResponse>> createEquipment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIcuEquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                equipmentService.createEquipment(principal, request)));
    }

    @GetMapping("/equipment")
    @PreAuthorize("hasAuthority('icu:equipment:read')")
    public ResponseEntity<ApiResponse<List<IcuEquipmentResponse>>> listEquipment(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                equipmentService.listEquipment(principal, hospitalId, branchId)));
    }

    @PostMapping("/equipment/{equipmentId}/assign")
    @PreAuthorize("hasAuthority('icu:equipment:write')")
    public ResponseEntity<ApiResponse<IcuEquipmentAssignmentResponse>> assignEquipment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID equipmentId,
            @Valid @RequestBody AssignIcuEquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                equipmentService.assignEquipment(principal, equipmentId, request)));
    }

    @PostMapping("/equipment-assignments/{assignmentId}/release")
    @PreAuthorize("hasAuthority('icu:equipment:write')")
    public ResponseEntity<ApiResponse<IcuEquipmentAssignmentResponse>> releaseEquipment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assignmentId) {
        return ResponseEntity.ok(ApiResponse.ok(
                equipmentService.releaseEquipment(principal, assignmentId)));
    }

    @GetMapping("/stays/{stayId}/equipment-assignments")
    @PreAuthorize("hasAuthority('icu:equipment:read')")
    public ResponseEntity<ApiResponse<List<IcuEquipmentAssignmentResponse>>> listEquipmentAssignments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID stayId) {
        return ResponseEntity.ok(ApiResponse.ok(
                equipmentService.listEquipmentAssignments(principal, stayId)));
    }
}
