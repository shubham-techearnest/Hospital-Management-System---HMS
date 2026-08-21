package com.health360.opd.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.opd.application.service.OpdDeskService;
import com.health360.opd.application.service.OpdDoctorCatalogService;
import com.health360.opd.application.service.OpdQueueService;
import com.health360.opd.application.service.OpdRegistrationService;
import com.health360.opd.presentation.dto.request.CheckInAppointmentRequest;
import com.health360.opd.presentation.dto.request.CreateOpdDeskRequest;
import com.health360.opd.presentation.dto.request.OpdQueueActionRequest;
import com.health360.opd.presentation.dto.request.SkipQueueEntryRequest;
import com.health360.opd.presentation.dto.request.WalkInRegistrationRequest;
import com.health360.opd.presentation.dto.response.OpdDeskResponse;
import com.health360.opd.presentation.dto.response.OpdDoctorOptionResponse;
import com.health360.opd.presentation.dto.response.OpdQueueEntryResponse;
import com.health360.opd.presentation.dto.response.OpdRegistrationResponse;
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
@RequestMapping("/api/v1/opd")
@RequiredArgsConstructor
public class OpdController {

    private final OpdDeskService deskService;
    private final OpdRegistrationService registrationService;
    private final OpdQueueService queueService;
    private final OpdDoctorCatalogService doctorCatalogService;

    @PostMapping("/desks")
    @PreAuthorize("hasAuthority('opd:desk:write')")
    public ResponseEntity<ApiResponse<OpdDeskResponse>> createDesk(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOpdDeskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                deskService.createDesk(principal, request)));
    }

    @GetMapping("/desks")
    @PreAuthorize("hasAuthority('opd:desk:read')")
    public ResponseEntity<ApiResponse<List<OpdDeskResponse>>> listDesks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                deskService.listDesks(principal, hospitalId, branchId)));
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasAnyAuthority('opd:registration:write', 'opd:queue:read', 'hospital:doctors:read')")
    public ResponseEntity<ApiResponse<List<OpdDoctorOptionResponse>>> listDoctors(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorCatalogService.listDoctors(principal, hospitalId, branchId)));
    }

    @PostMapping("/registrations/walk-in")
    @PreAuthorize("hasAuthority('opd:registration:write')")
    public ResponseEntity<ApiResponse<OpdRegistrationResponse>> registerWalkIn(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WalkInRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                registrationService.registerWalkIn(principal, request)));
    }

    @PostMapping("/registrations/check-in")
    @PreAuthorize("hasAuthority('opd:registration:write')")
    public ResponseEntity<ApiResponse<OpdRegistrationResponse>> checkInAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckInAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                registrationService.checkInAppointment(principal, request)));
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAuthority('opd:queue:read')")
    public ResponseEntity<ApiResponse<Page<OpdQueueEntryResponse>>> listQueue(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate queueDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID deskId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                queueService.listQueue(principal, hospitalId, branchId, queueDate, status, deskId, pageable)));
    }

    @PostMapping("/queue/{queueEntryId}/call")
    @PreAuthorize("hasAuthority('opd:queue:write')")
    public ResponseEntity<ApiResponse<OpdQueueEntryResponse>> callPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID queueEntryId,
            @RequestBody(required = false) OpdQueueActionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                queueService.callPatient(principal, queueEntryId,
                        request != null ? request : new OpdQueueActionRequest())));
    }

    @PostMapping("/queue/{queueEntryId}/start")
    @PreAuthorize("hasAuthority('opd:queue:write')")
    public ResponseEntity<ApiResponse<OpdQueueEntryResponse>> startService(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID queueEntryId,
            @RequestBody(required = false) OpdQueueActionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                queueService.startService(principal, queueEntryId,
                        request != null ? request : new OpdQueueActionRequest())));
    }

    @PostMapping("/queue/{queueEntryId}/complete")
    @PreAuthorize("hasAuthority('opd:queue:write')")
    public ResponseEntity<ApiResponse<OpdQueueEntryResponse>> completeService(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID queueEntryId) {
        return ResponseEntity.ok(ApiResponse.ok(
                queueService.completeService(principal, queueEntryId)));
    }

    @PostMapping("/queue/{queueEntryId}/cancel")
    @PreAuthorize("hasAuthority('opd:queue:write')")
    public ResponseEntity<ApiResponse<OpdQueueEntryResponse>> cancelEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID queueEntryId) {
        return ResponseEntity.ok(ApiResponse.ok(
                queueService.cancelEntry(principal, queueEntryId)));
    }

    @PostMapping("/queue/{queueEntryId}/skip")
    @PreAuthorize("hasAuthority('opd:queue:write')")
    public ResponseEntity<ApiResponse<OpdQueueEntryResponse>> skipPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID queueEntryId,
            @RequestBody(required = false) SkipQueueEntryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                queueService.skipPatient(principal, queueEntryId,
                        request != null ? request : new SkipQueueEntryRequest())));
    }

    @PostMapping("/queue/{queueEntryId}/recall")
    @PreAuthorize("hasAuthority('opd:queue:write')")
    public ResponseEntity<ApiResponse<OpdQueueEntryResponse>> recallPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID queueEntryId,
            @RequestBody(required = false) OpdQueueActionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                queueService.recallPatient(principal, queueEntryId,
                        request != null ? request : new OpdQueueActionRequest())));
    }
}
