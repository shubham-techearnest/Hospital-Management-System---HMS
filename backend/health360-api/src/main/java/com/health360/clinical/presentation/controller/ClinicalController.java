package com.health360.clinical.presentation.controller;

import com.health360.clinical.application.service.ClinicalOrderService;
import com.health360.clinical.application.service.ClinicalTimelineService;
import com.health360.clinical.application.service.ClinicalVitalsService;
import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.application.service.PrescriptionService;
import com.health360.clinical.presentation.dto.request.*;
import com.health360.clinical.presentation.dto.response.*;
import com.health360.config.security.UserPrincipal;
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
@RequestMapping("/api/v1/clinical")
@RequiredArgsConstructor
public class ClinicalController {

    private final EncounterService encounterService;
    private final ClinicalOrderService clinicalOrderService;
    private final ClinicalVitalsService clinicalVitalsService;
    private final ClinicalTimelineService clinicalTimelineService;
    private final PrescriptionService prescriptionService;

    @PostMapping("/encounters")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<EncounterResponse>> createEncounter(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateEncounterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                encounterService.createEncounter(principal, request)));
    }

    @GetMapping("/encounters/me")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<Page<EncounterResponse>>> listMyEncounters(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(encounterService.listMyEncounters(principal, pageable)));
    }

    @GetMapping("/encounters/doctor/me")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<Page<EncounterResponse>>> listDoctorMyEncounters(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "false") boolean todayOnly,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.listDoctorMyEncounters(principal, todayOnly, status, pageable)));
    }

    @GetMapping("/encounters/hospital/{hospitalId}")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<Page<EncounterResponse>>> listHospitalEncounters(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID hospitalId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.listHospitalEncounters(principal, hospitalId, pageable)));
    }

    @GetMapping("/encounters")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<Page<EncounterResponse>>> listEncounters(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) UUID doctorId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.listEncounters(principal, patientId, hospitalId, doctorId, pageable)));
    }

    @GetMapping("/encounters/{encounterId}")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<EncounterResponse>> getEncounter(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.getEncounter(principal, encounterId)));
    }

    @PostMapping("/encounters/{encounterId}/check-in")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<EncounterResponse>> checkInEncounter(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.checkInEncounter(principal, encounterId)));
    }

    @PostMapping("/encounters/{encounterId}/start")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<EncounterResponse>> startEncounter(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.startEncounter(principal, encounterId)));
    }

    @PostMapping("/encounters/{encounterId}/complete")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<EncounterResponse>> completeEncounter(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.completeEncounter(principal, encounterId)));
    }

    @PatchMapping("/encounters/{encounterId}/status")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<EncounterResponse>> updateEncounterStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody UpdateEncounterStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.updateEncounterStatus(principal, encounterId, request)));
    }

    @PostMapping("/encounters/{encounterId}/diagnoses")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<DiagnosisResponse>> addDiagnosis(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateDiagnosisRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                encounterService.addDiagnosis(principal, encounterId, request)));
    }

    @GetMapping("/encounters/{encounterId}/diagnoses")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<List<DiagnosisResponse>>> listDiagnoses(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.listDiagnoses(principal, encounterId)));
    }

    @PostMapping("/encounters/{encounterId}/notes")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<ClinicalNoteResponse>> addNote(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateClinicalNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                encounterService.addNote(principal, encounterId, request)));
    }

    @PutMapping("/encounters/{encounterId}/notes/{noteId}")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<ClinicalNoteResponse>> updateNote(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @PathVariable UUID noteId,
            @Valid @RequestBody UpdateClinicalNoteRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.updateNote(principal, encounterId, noteId, request)));
    }

    @PostMapping("/encounters/{encounterId}/notes/{noteId}/finalize")
    @PreAuthorize("hasAuthority('clinical:encounter:write')")
    public ResponseEntity<ApiResponse<ClinicalNoteResponse>> finalizeNote(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @PathVariable UUID noteId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.finalizeNote(principal, encounterId, noteId)));
    }

    @GetMapping("/encounters/{encounterId}/notes")
    @PreAuthorize("hasAuthority('clinical:encounter:read')")
    public ResponseEntity<ApiResponse<List<ClinicalNoteResponse>>> listNotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                encounterService.listNotes(principal, encounterId)));
    }

    @PostMapping("/encounters/{encounterId}/orders")
    @PreAuthorize("hasAuthority('clinical:order:write')")
    public ResponseEntity<ApiResponse<ClinicalOrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateClinicalOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                clinicalOrderService.createOrder(principal, encounterId, request)));
    }

    @GetMapping("/encounters/{encounterId}/orders")
    @PreAuthorize("hasAuthority('clinical:order:read')")
    public ResponseEntity<ApiResponse<List<ClinicalOrderResponse>>> listOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalOrderService.listOrders(principal, encounterId)));
    }

    @GetMapping("/encounters/{encounterId}/orders/{orderId}")
    @PreAuthorize("hasAuthority('clinical:order:read')")
    public ResponseEntity<ApiResponse<ClinicalOrderResponse>> getOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalOrderService.getOrder(principal, encounterId, orderId)));
    }

    @PostMapping("/encounters/{encounterId}/prescriptions")
    @PreAuthorize("hasAuthority('clinical:prescription:write')")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreatePrescriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                prescriptionService.create(principal, encounterId, request)));
    }

    @PutMapping("/encounters/{encounterId}/prescriptions/{prescriptionId}")
    @PreAuthorize("hasAuthority('clinical:prescription:write')")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> updatePrescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @PathVariable UUID prescriptionId,
            @Valid @RequestBody UpdatePrescriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                prescriptionService.update(principal, encounterId, prescriptionId, request)));
    }

    @PostMapping("/encounters/{encounterId}/prescriptions/{prescriptionId}/sign")
    @PreAuthorize("hasAuthority('clinical:prescription:sign')")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> signPrescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @PathVariable UUID prescriptionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                prescriptionService.sign(principal, encounterId, prescriptionId)));
    }

    @GetMapping("/encounters/{encounterId}/prescriptions")
    @PreAuthorize("hasAuthority('clinical:prescription:read')")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> listPrescriptions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                prescriptionService.listForEncounter(principal, encounterId)));
    }

    @GetMapping("/encounters/{encounterId}/prescriptions/{prescriptionId}")
    @PreAuthorize("hasAuthority('clinical:prescription:read')")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @PathVariable UUID prescriptionId) {
        return ResponseEntity.ok(ApiResponse.ok(
                prescriptionService.get(principal, encounterId, prescriptionId)));
    }

    @GetMapping("/prescriptions/me")
    @PreAuthorize("hasAuthority('clinical:prescription:read')")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> listMyPrescriptions(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.listMySigned(principal)));
    }

    @PostMapping("/encounters/{encounterId}/vitals")
    @PreAuthorize("hasAuthority('clinical:vitals:write')")
    public ResponseEntity<ApiResponse<ClinicalVitalSignResponse>> recordVitals(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId,
            @Valid @RequestBody RecordClinicalVitalsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                clinicalVitalsService.recordVitals(principal, encounterId, request)));
    }

    @GetMapping("/encounters/{encounterId}/vitals")
    @PreAuthorize("hasAuthority('clinical:vitals:read')")
    public ResponseEntity<ApiResponse<List<ClinicalVitalSignResponse>>> listVitals(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID encounterId) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalVitalsService.listVitals(principal, encounterId)));
    }

    @GetMapping("/patients/{patientId}/timeline")
    @PreAuthorize("hasAuthority('clinical:timeline:read')")
    public ResponseEntity<ApiResponse<Page<ClinicalTimelineItemResponse>>> getPatientClinicalTimeline(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalTimelineService.getStaffTimeline(principal, patientId, pageable)));
    }
}
