package com.health360.scheduling.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.scheduling.application.service.AppointmentLifecycleService;
import com.health360.scheduling.application.service.AppointmentService;
import com.health360.scheduling.application.service.DoctorScheduleService;
import com.health360.scheduling.application.service.SlotBlockService;
import com.health360.scheduling.presentation.dto.request.AppointmentActionRequest;
import com.health360.scheduling.presentation.dto.request.BlockScheduleRequest;
import com.health360.scheduling.presentation.dto.request.BookAppointmentRequest;
import com.health360.scheduling.presentation.dto.request.CancelAppointmentRequest;
import com.health360.scheduling.presentation.dto.request.CreateScheduleRequest;
import com.health360.scheduling.presentation.dto.request.RescheduleAppointmentRequest;
import com.health360.scheduling.presentation.dto.request.UpdateAppointmentStatusRequest;
import com.health360.scheduling.presentation.dto.response.AppointmentBookingResponse;
import com.health360.scheduling.presentation.dto.response.AppointmentDetailResponse;
import com.health360.scheduling.presentation.dto.response.AppointmentSummaryResponse;
import com.health360.scheduling.presentation.dto.response.DoctorBookingLocationResponse;
import com.health360.scheduling.presentation.dto.response.DoctorAvailabilityResponse;
import com.health360.scheduling.presentation.dto.response.ScheduleResponse;
import com.health360.scheduling.presentation.dto.response.SlotBlockResponse;
import com.health360.shared.dto.ApiResponse;
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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/scheduling")
@RequiredArgsConstructor
public class SchedulingController {

    private final DoctorScheduleService doctorScheduleService;
    private final AppointmentService appointmentService;
    private final AppointmentLifecycleService appointmentLifecycleService;
    private final SlotBlockService slotBlockService;

    @GetMapping("/doctors/me/schedules")
    @PreAuthorize("hasAuthority('schedule:read')")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> listMySchedules(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorScheduleService.listSchedules(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/doctors/me/schedules")
    @PreAuthorize("hasAuthority('schedule:write')")
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                doctorScheduleService.createSchedule(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/doctors/me/schedules/{scheduleId}")
    @PreAuthorize("hasAuthority('schedule:write')")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID scheduleId,
            @Valid @RequestBody CreateScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorScheduleService.updateSchedule(
                        principal.getUserId(), principal.getTenantId(), scheduleId, request)));
    }

    @PostMapping("/doctors/me/schedules/{scheduleId}/block")
    @PreAuthorize("hasAuthority('schedule:write')")
    public ResponseEntity<ApiResponse<SlotBlockResponse>> blockScheduleSlots(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID scheduleId,
            @Valid @RequestBody BlockScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                slotBlockService.blockSlots(
                        principal.getUserId(), principal.getTenantId(), scheduleId, request)));
    }

    @PostMapping("/doctors/me/schedules/{scheduleId}/unblock")
    @PreAuthorize("hasAuthority('schedule:write')")
    public ResponseEntity<ApiResponse<SlotBlockResponse>> unblockScheduleSlots(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID scheduleId,
            @Valid @RequestBody BlockScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                slotBlockService.unblockSlots(
                        principal.getUserId(), principal.getTenantId(), scheduleId, request)));
    }

    @GetMapping("/doctors/{doctorId}/locations")
    public ResponseEntity<ApiResponse<List<DoctorBookingLocationResponse>>> getDoctorBookingLocations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentService.getDoctorBookingLocations(doctorId, principal.getTenantId())));
    }

    @GetMapping("/doctors/{doctorId}/availability")
    public ResponseEntity<ApiResponse<DoctorAvailabilityResponse>> getDoctorAvailability(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID doctorId,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentService.getDoctorAvailability(
                        doctorId, principal.getTenantId(), hospitalId, branchId, fromDate, toDate)));
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasAuthority('appointment:book')")
    public ResponseEntity<ApiResponse<AppointmentBookingResponse>> bookAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BookAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                appointmentService.bookAppointment(principal.getUserId(), principal.getTenantId(), request)));
    }

    @GetMapping("/appointments/me")
    @PreAuthorize("hasAuthority('appointment:view:own')")
    public ResponseEntity<ApiResponse<Page<AppointmentSummaryResponse>>> listMyAppointments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false, defaultValue = "all") String filter,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.listPatientAppointments(
                        principal.getUserId(), principal.getTenantId(), filter, pageable)));
    }

    @GetMapping("/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}")
    @PreAuthorize("hasAuthority('appointment:view:own')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> getPatientAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.getPatientAppointment(
                        principal.getUserId(), principal.getTenantId(), appointmentId)));
    }

    @PostMapping("/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}/cancel")
    @PreAuthorize("hasAuthority('appointment:cancel')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> cancelAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) CancelAppointmentRequest request) {
        CancelAppointmentRequest body = request != null ? request : new CancelAppointmentRequest();
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.cancelAppointment(
                        principal.getUserId(), principal.getTenantId(), appointmentId, body, false)));
    }

    @PostMapping("/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}/reschedule")
    @PreAuthorize("hasAuthority('appointment:reschedule')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> rescheduleAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId,
            @Valid @RequestBody RescheduleAppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.rescheduleAppointment(
                        principal.getUserId(), principal.getTenantId(), appointmentId, request)));
    }

    @GetMapping("/doctors/me/appointments")
    @PreAuthorize("hasAuthority('appointment:view:own')")
    public ResponseEntity<ApiResponse<List<AppointmentSummaryResponse>>> listDoctorAppointments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false, defaultValue = "all") String filter) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.listDoctorAppointments(
                        principal.getUserId(), principal.getTenantId(), filter)));
    }

    @GetMapping("/doctors/me/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}")
    @PreAuthorize("hasAuthority('appointment:view:own')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> getDoctorAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.getDoctorAppointment(
                        principal.getUserId(), principal.getTenantId(), appointmentId)));
    }

    @PostMapping("/doctors/me/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}/cancel")
    @PreAuthorize("hasAuthority('appointment:cancel')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> doctorCancelAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) CancelAppointmentRequest request) {
        CancelAppointmentRequest body = request != null ? request : new CancelAppointmentRequest();
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.cancelAppointment(
                        principal.getUserId(), principal.getTenantId(), appointmentId, body, true)));
    }

    @PatchMapping("/doctors/me/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}/status")
    @PreAuthorize("hasAuthority('appointment:manage')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> updateAppointmentStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId,
            @Valid @RequestBody UpdateAppointmentStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.updateAppointmentStatus(
                        principal.getUserId(), principal.getTenantId(), appointmentId, request)));
    }

    @PostMapping("/doctors/me/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}/confirm")
    @PreAuthorize("hasAuthority('appointment:manage')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> confirmAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.confirmAppointment(
                        principal.getUserId(), principal.getTenantId(), appointmentId)));
    }

    @PostMapping("/doctors/me/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}/request-reschedule")
    @PreAuthorize("hasAuthority('appointment:manage')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> requestReschedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.requestReschedule(
                        principal.getUserId(), principal.getTenantId(), appointmentId, request)));
    }

    @PostMapping("/doctors/me/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}/postpone")
    @PreAuthorize("hasAuthority('appointment:manage')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> postponeAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentActionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.postponeAppointment(
                        principal.getUserId(), principal.getTenantId(), appointmentId, request)));
    }

    @PostMapping("/doctors/me/appointments/{appointmentId:[0-9a-fA-F\\-]{36}}/resume")
    @PreAuthorize("hasAuthority('appointment:manage')")
    public ResponseEntity<ApiResponse<AppointmentDetailResponse>> resumeAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentLifecycleService.resumeAppointment(
                        principal.getUserId(), principal.getTenantId(), appointmentId)));
    }
}
