package com.health360.staffops.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.shared.dto.ApiResponse;
import com.health360.staffops.application.service.StaffOpsService;
import com.health360.staffops.presentation.dto.request.CreateLeaveRequestRequest;
import com.health360.staffops.presentation.dto.request.CreateRosterEntryRequest;
import com.health360.staffops.presentation.dto.request.CreateStaffShiftRequest;
import com.health360.staffops.presentation.dto.request.DecideLeaveRequestRequest;
import com.health360.staffops.presentation.dto.request.RecordAttendanceRequest;
import com.health360.staffops.presentation.dto.response.AttendanceResponse;
import com.health360.staffops.presentation.dto.response.LeaveRequestResponse;
import com.health360.staffops.presentation.dto.response.RosterEntryResponse;
import com.health360.staffops.presentation.dto.response.StaffShiftResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/staff-ops")
@RequiredArgsConstructor
public class StaffOpsController {

    private final StaffOpsService staffOpsService;

    @PostMapping("/shifts")
    @PreAuthorize("hasAuthority('staffops:write')")
    public ResponseEntity<ApiResponse<StaffShiftResponse>> createShift(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateStaffShiftRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(staffOpsService.createShift(principal, request)));
    }

    @GetMapping("/shifts")
    @PreAuthorize("hasAuthority('staffops:read')")
    public ResponseEntity<ApiResponse<List<StaffShiftResponse>>> listShifts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(staffOpsService.listShifts(principal, hospitalId, branchId)));
    }

    @PostMapping("/roster")
    @PreAuthorize("hasAuthority('staffops:write')")
    public ResponseEntity<ApiResponse<RosterEntryResponse>> createRoster(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateRosterEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(staffOpsService.createRosterEntry(principal, request)));
    }

    @GetMapping("/roster")
    @PreAuthorize("hasAuthority('staffops:read')")
    public ResponseEntity<ApiResponse<Page<RosterEntryResponse>>> listRoster(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                staffOpsService.listRoster(principal, hospitalId, branchId, from, to, pageable)));
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasAuthority('staffops:write')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> recordAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RecordAttendanceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(staffOpsService.recordAttendance(principal, request)));
    }

    @GetMapping("/attendance")
    @PreAuthorize("hasAuthority('staffops:read')")
    public ResponseEntity<ApiResponse<Page<AttendanceResponse>>> listAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                staffOpsService.listAttendance(principal, hospitalId, branchId, from, to, pageable)));
    }

    @PostMapping("/leave")
    @PreAuthorize("hasAuthority('staffops:write')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> createLeave(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateLeaveRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(staffOpsService.createLeave(principal, request)));
    }

    @GetMapping("/leave")
    @PreAuthorize("hasAuthority('staffops:read')")
    public ResponseEntity<ApiResponse<Page<LeaveRequestResponse>>> listLeave(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                staffOpsService.listLeave(principal, hospitalId, branchId, status, pageable)));
    }

    @PostMapping("/leave/{leaveRequestId}/decide")
    @PreAuthorize("hasAuthority('staffops:approve')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> decideLeave(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID leaveRequestId,
            @Valid @RequestBody DecideLeaveRequestRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                staffOpsService.decideLeave(principal, leaveRequestId, request)));
    }
}
