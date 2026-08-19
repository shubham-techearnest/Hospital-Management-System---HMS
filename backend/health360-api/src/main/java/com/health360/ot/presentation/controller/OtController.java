package com.health360.ot.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.ot.application.service.OtFacilityService;
import com.health360.ot.application.service.OtProcedureService;
import com.health360.ot.presentation.dto.request.*;
import com.health360.ot.presentation.dto.response.*;
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
@RequestMapping("/api/v1/ot")
@RequiredArgsConstructor
public class OtController {

    private final OtFacilityService facilityService;
    private final OtProcedureService procedureService;

    @PostMapping("/theatres")
    @PreAuthorize("hasAuthority('ot:theatre:write')")
    public ResponseEntity<ApiResponse<OperationTheatreResponse>> createTheatre(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOperationTheatreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                facilityService.createTheatre(principal, request)));
    }

    @GetMapping("/theatres")
    @PreAuthorize("hasAuthority('ot:theatre:read')")
    public ResponseEntity<ApiResponse<List<OperationTheatreResponse>>> listTheatres(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                facilityService.listTheatres(principal, hospitalId, branchId)));
    }

    @GetMapping("/worklist/pending")
    @PreAuthorize("hasAuthority('ot:procedure:read')")
    public ResponseEntity<ApiResponse<List<OtWorklistItemResponse>>> listPendingWorklist(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                procedureService.listPendingWorklist(principal, hospitalId, branchId)));
    }

    @PostMapping("/procedures")
    @PreAuthorize("hasAuthority('ot:procedure:write')")
    public ResponseEntity<ApiResponse<OtProcedureResponse>> createProcedure(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOtProcedureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                procedureService.createProcedure(principal, request)));
    }

    @GetMapping("/procedures")
    @PreAuthorize("hasAuthority('ot:procedure:read')")
    public ResponseEntity<ApiResponse<Page<OtProcedureResponse>>> listProcedures(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                procedureService.listProcedures(principal, hospitalId, branchId, status, pageable)));
    }

    @GetMapping("/procedures/{procedureId}")
    @PreAuthorize("hasAuthority('ot:procedure:read')")
    public ResponseEntity<ApiResponse<OtProcedureResponse>> getProcedure(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID procedureId) {
        return ResponseEntity.ok(ApiResponse.ok(
                procedureService.getProcedure(principal, procedureId)));
    }

    @PostMapping("/procedures/{procedureId}/schedule")
    @PreAuthorize("hasAuthority('ot:schedule:write')")
    public ResponseEntity<ApiResponse<OtProcedureResponse>> scheduleProcedure(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID procedureId,
            @Valid @RequestBody ScheduleOtProcedureRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                procedureService.scheduleProcedure(principal, procedureId, request)));
    }

    @PostMapping("/procedures/{procedureId}/team")
    @PreAuthorize("hasAuthority('ot:procedure:write')")
    public ResponseEntity<ApiResponse<OtTeamMemberResponse>> addTeamMember(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID procedureId,
            @Valid @RequestBody AddOtTeamMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                procedureService.addTeamMember(principal, procedureId, request)));
    }

    @PostMapping("/procedures/{procedureId}/notes")
    @PreAuthorize("hasAuthority('ot:procedure:write')")
    public ResponseEntity<ApiResponse<OtNoteResponse>> addNote(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID procedureId,
            @Valid @RequestBody AddOtNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                procedureService.addNote(principal, procedureId, request)));
    }

    @PostMapping("/procedures/{procedureId}/start")
    @PreAuthorize("hasAuthority('ot:procedure:write')")
    public ResponseEntity<ApiResponse<OtProcedureResponse>> startProcedure(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID procedureId) {
        return ResponseEntity.ok(ApiResponse.ok(
                procedureService.startProcedure(principal, procedureId)));
    }

    @PostMapping("/procedures/{procedureId}/complete")
    @PreAuthorize("hasAuthority('ot:procedure:write')")
    public ResponseEntity<ApiResponse<OtProcedureResponse>> completeProcedure(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID procedureId,
            @Valid @RequestBody CompleteOtProcedureRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                procedureService.completeProcedure(principal, procedureId, request)));
    }

    @GetMapping("/encounters/{encounterId}/procedures")
    @PreAuthorize("hasAnyAuthority('ot:procedure:read', 'clinical:encounter:read', 'clinical:encounter:write')")
    public ResponseEntity<ApiResponse<List<OtProcedureResponse>>> listEncounterProcedures(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                procedureService.listCompletedProceduresForEncounter(principal, encounterId)));
    }
}
