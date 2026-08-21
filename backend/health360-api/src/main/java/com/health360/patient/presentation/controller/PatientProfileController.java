package com.health360.patient.presentation.controller;

import com.health360.clinical.application.service.ClinicalTimelineService;
import com.health360.clinical.presentation.dto.response.ClinicalTimelineItemResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.patient.application.service.*;
import com.health360.patient.presentation.dto.request.*;
import com.health360.patient.presentation.dto.response.*;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientProfileController {

    private final PatientProfileService patientProfileService;
    private final VitalSignService vitalSignService;
    private final FamilyMemberService familyMemberService;
    private final LabValueService labValueService;
    private final HealthDocumentService healthDocumentService;
    private final HealthTimelineService healthTimelineService;
    private final ClinicalTimelineService clinicalTimelineService;

    @GetMapping("/me/profile")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.getProfile(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile/consent")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> acceptConsent(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ConsentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.acceptConsent(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/basic-info")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> updateBasicInfo(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateBasicInfoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updateBasicInfo(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/contact-info")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> updateContactInfo(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateContactInfoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updateContactInfo(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/physical-measurements")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> updatePhysicalMeasurements(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdatePhysicalMeasurementsRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updatePhysicalMeasurements(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @GetMapping("/me/profile/physical-measurements/history")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<Page<PatientProfileResponse.PhysicalMeasurementHistoryResponse>>> getMeasurementHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "measuredAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.getMeasurementHistory(
                        principal.getUserId(), principal.getTenantId(), pageable)));
    }

    @PutMapping("/me/profile/lifestyle")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> updateLifestyle(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateLifestyleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updateLifestyle(principal.getUserId(), principal.getTenantId(), request)));
    }

    @GetMapping("/me/profile/completion")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.ProfileCompletionResponse>> getCompletion(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.getCompletion(principal.getUserId(), principal.getTenantId())));
    }

    // Allergies
    @GetMapping("/me/profile/allergies")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<List<PatientProfileResponse.AllergyResponse>>> listAllergies(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.listAllergies(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile/allergies")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.AllergyResponse>> createAllergy(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AllergyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.createAllergy(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/allergies/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.AllergyResponse>> updateAllergy(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AllergyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updateAllergy(principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/allergies/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteAllergy(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        patientProfileService.deleteAllergy(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // Medications
    @GetMapping("/me/profile/medications")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<List<PatientProfileResponse.MedicationResponse>>> listMedications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.listMedications(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile/medications")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.MedicationResponse>> createMedication(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MedicationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.createMedication(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/medications/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.MedicationResponse>> updateMedication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody MedicationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updateMedication(principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/medications/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteMedication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        patientProfileService.deleteMedication(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // Surgeries
    @GetMapping("/me/profile/surgeries")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<List<PatientProfileResponse.SurgeryResponse>>> listSurgeries(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.listSurgeries(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile/surgeries")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.SurgeryResponse>> createSurgery(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SurgeryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.createSurgery(principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/surgeries/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.SurgeryResponse>> updateSurgery(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody SurgeryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updateSurgery(principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/surgeries/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteSurgery(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        patientProfileService.deleteSurgery(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // Chronic conditions
    @GetMapping("/me/profile/chronic-conditions")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<List<PatientProfileResponse.ChronicConditionResponse>>> listChronicConditions(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.listChronicConditions(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile/chronic-conditions")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.ChronicConditionResponse>> createChronicCondition(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChronicConditionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.createChronicCondition(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/chronic-conditions/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.ChronicConditionResponse>> updateChronicCondition(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody ChronicConditionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updateChronicCondition(
                        principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/chronic-conditions/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteChronicCondition(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        patientProfileService.deleteChronicCondition(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // Emergency contacts
    @GetMapping("/me/profile/emergency-contacts")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<List<PatientProfileResponse.EmergencyContactResponse>>> listEmergencyContacts(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.listEmergencyContacts(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile/emergency-contacts")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.EmergencyContactResponse>> createEmergencyContact(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody EmergencyContactRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.createEmergencyContact(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/emergency-contacts/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse.EmergencyContactResponse>> updateEmergencyContact(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody EmergencyContactRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updateEmergencyContact(
                        principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/emergency-contacts/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteEmergencyContact(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        patientProfileService.deleteEmergencyContact(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/me/profile/vitals")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<VitalSignResponse>> recordVitals(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RecordVitalSignsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                vitalSignService.recordVitals(principal.getUserId(), principal.getTenantId(), request)));
    }

    @GetMapping("/me/profile/vitals")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<Page<VitalSignResponse>>> getVitalsHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant toDate,
            @PageableDefault(size = 20, sort = "recordedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                vitalSignService.getVitalsHistory(
                        principal.getUserId(), principal.getTenantId(), fromDate, toDate, pageable)));
    }

    @GetMapping("/me/profile/vitals/latest")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<VitalSignResponse>> getLatestVitals(
            @AuthenticationPrincipal UserPrincipal principal) {
        VitalSignResponse latest = vitalSignService.getLatestVitals(
                principal.getUserId(), principal.getTenantId());
        return ResponseEntity.ok(ApiResponse.ok(latest));
    }

    @PutMapping("/me/profile/health-goals")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> updateHealthGoals(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateHealthGoalsRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                patientProfileService.updateGoals(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    // Family members
    @GetMapping("/me/profile/family-members")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<List<FamilyMemberResponse>>> listFamilyMembers(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                familyMemberService.listFamilyMembers(principal.getUserId(), principal.getTenantId())));
    }

    @PostMapping("/me/profile/family-members")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<FamilyMemberResponse>> createFamilyMember(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FamilyMemberRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                familyMemberService.createFamilyMember(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @PutMapping("/me/profile/family-members/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<FamilyMemberResponse>> updateFamilyMember(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody FamilyMemberRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                familyMemberService.updateFamilyMember(
                        principal.getUserId(), principal.getTenantId(), id, request)));
    }

    @DeleteMapping("/me/profile/family-members/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyMember(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        familyMemberService.deleteFamilyMember(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/me/profile/lab-values")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<LabValueResponse>> recordLabValues(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RecordLabValuesRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                labValueService.recordLabValues(
                        principal.getUserId(), principal.getTenantId(), request)));
    }

    @GetMapping("/me/profile/lab-values")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<Page<LabValueResponse>>> getLabValuesHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "recordedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                labValueService.getLabHistory(principal.getUserId(), principal.getTenantId(), pageable)));
    }

    @PostMapping(value = "/me/profile/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<HealthDocumentResponse>> uploadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("file") MultipartFile file,
            @RequestParam String category,
            @RequestParam String title,
            @RequestParam(required = false) String description) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                healthDocumentService.uploadDocument(
                        principal.getUserId(), principal.getTenantId(),
                        file, category, title, description)));
    }

    @GetMapping("/me/profile/documents")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<Page<HealthDocumentResponse>>> listDocuments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                healthDocumentService.listDocuments(
                        principal.getUserId(), principal.getTenantId(), category, pageable)));
    }

    @GetMapping("/me/profile/documents/{id}/download")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<Resource> downloadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        HealthDocumentService.DocumentContent content = healthDocumentService.downloadDocument(
                principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok()
                .contentType(content.contentType())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + content.fileName() + "\"")
                .body(content.resource());
    }

    @DeleteMapping("/me/profile/documents/{id}")
    @PreAuthorize("hasAuthority('patient:profile:write')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        healthDocumentService.deleteDocument(principal.getUserId(), principal.getTenantId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/me/profile/timeline")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<Page<HealthTimelineEventResponse>>> getTimeline(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "occurredAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                healthTimelineService.getTimeline(
                        principal.getUserId(), principal.getTenantId(), pageable)));
    }

    @GetMapping("/me/clinical-timeline")
    @PreAuthorize("hasAuthority('patient:profile:read')")
    public ResponseEntity<ApiResponse<Page<ClinicalTimelineItemResponse>>> getMyClinicalTimeline(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                clinicalTimelineService.getMyClinicalTimeline(principal, pageable)));
    }
}
