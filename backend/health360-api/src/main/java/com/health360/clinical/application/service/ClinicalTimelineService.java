package com.health360.clinical.application.service;

import com.health360.clinical.infrastructure.persistence.entity.*;
import com.health360.clinical.infrastructure.persistence.repository.*;
import com.health360.clinical.presentation.dto.response.ClinicalTimelineItemResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClinicalTimelineService {

    private static final int MAX_ENCOUNTERS = 50;

    private final EncounterRepository encounterRepository;
    private final ClinicalVitalSignRepository vitalSignRepository;
    private final ClinicalDiagnosisRepository diagnosisRepository;
    private final ClinicalNoteRepository noteRepository;
    private final ClinicalOrderRepository orderRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final EncounterAccessService accessService;

    @Transactional(readOnly = true)
    public Page<ClinicalTimelineItemResponse> getStaffTimeline(
            UserPrincipal principal, UUID patientId, Pageable pageable) {
        accessService.assertCanReadClinicalTimeline(principal);
        requirePatient(principal.getTenantId(), patientId);
        return pageItems(buildItems(principal.getTenantId(), patientId), pageable);
    }

    @Transactional(readOnly = true)
    public Page<ClinicalTimelineItemResponse> getMyClinicalTimeline(
            UserPrincipal principal, Pageable pageable) {
        PatientProfileEntity profile = patientProfileRepository
                .findByTenantIdAndUserIdAndDeletedAtIsNull(principal.getTenantId(), principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient profile not found"));
        if (!profile.isConsentAccepted()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Health data consent must be accepted before accessing clinical timeline");
        }
        return pageItems(buildItems(principal.getTenantId(), profile.getId()), pageable);
    }

    private List<ClinicalTimelineItemResponse> buildItems(UUID tenantId, UUID patientId) {
        Page<EncounterEntity> encounters = encounterRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        tenantId, patientId, PageRequest.of(0, MAX_ENCOUNTERS));

        List<ClinicalTimelineItemResponse> items = new ArrayList<>();
        for (EncounterEntity encounter : encounters.getContent()) {
            items.add(item(
                    encounter.getId() + ":ENCOUNTER_REGISTERED",
                    "ENCOUNTER_REGISTERED",
                    encounter.getEncounterType() + " encounter " + encounter.getEncounterNumber() + " registered",
                    encounter.getCreatedAt(),
                    encounter,
                    "Encounter",
                    encounter.getId(),
                    Map.of(
                            "status", encounter.getStatus(),
                            "encounterType", encounter.getEncounterType())));

            if (encounter.getStartedAt() != null) {
                items.add(item(
                        encounter.getId() + ":ENCOUNTER_STARTED",
                        "ENCOUNTER_STARTED",
                        "Encounter " + encounter.getEncounterNumber() + " started",
                        encounter.getStartedAt(),
                        encounter,
                        "Encounter",
                        encounter.getId(),
                        Map.of("status", encounter.getStatus())));
            }
            if (encounter.getEndedAt() != null) {
                items.add(item(
                        encounter.getId() + ":ENCOUNTER_COMPLETED",
                        "ENCOUNTER_COMPLETED",
                        "Encounter " + encounter.getEncounterNumber() + " completed",
                        encounter.getEndedAt(),
                        encounter,
                        "Encounter",
                        encounter.getId(),
                        Map.of("status", encounter.getStatus())));
            }

            for (ClinicalVitalSignEntity vital : vitalSignRepository
                    .findByEncounterIdAndDeletedAtIsNullOrderByRecordedAtDesc(encounter.getId())) {
                items.add(item(
                        vital.getId().toString(),
                        "CLINICAL_VITALS",
                        summarizeVitals(vital),
                        vital.getRecordedAt(),
                        encounter,
                        "ClinicalVitalSign",
                        vital.getId(),
                        vitalsMetadata(vital)));
            }

            for (ClinicalDiagnosisEntity diagnosis : diagnosisRepository
                    .findByEncounterIdAndDeletedAtIsNullOrderByRecordedAtDesc(encounter.getId())) {
                items.add(item(
                        diagnosis.getId().toString(),
                        "CLINICAL_DIAGNOSIS",
                        "Diagnosis: " + diagnosis.getDiagnosisText(),
                        diagnosis.getRecordedAt() != null ? diagnosis.getRecordedAt() : diagnosis.getCreatedAt(),
                        encounter,
                        "ClinicalDiagnosis",
                        diagnosis.getId(),
                        Map.of(
                                "diagnosisType", diagnosis.getDiagnosisType(),
                                "diagnosisCode", diagnosis.getDiagnosisCode() != null ? diagnosis.getDiagnosisCode() : "")));
            }

            for (ClinicalNoteEntity note : noteRepository
                    .findByEncounterIdAndDeletedAtIsNullOrderByRecordedAtDesc(encounter.getId())) {
                String preview = note.getContent() != null && note.getContent().length() > 120
                        ? note.getContent().substring(0, 117) + "..."
                        : note.getContent();
                items.add(item(
                        note.getId().toString(),
                        "CLINICAL_NOTE",
                        note.getNoteType() + " note: " + preview,
                        note.getRecordedAt() != null ? note.getRecordedAt() : note.getCreatedAt(),
                        encounter,
                        "ClinicalNote",
                        note.getId(),
                        Map.of("noteType", note.getNoteType())));
            }

            for (ClinicalOrderEntity order : orderRepository
                    .findByEncounterIdAndDeletedAtIsNullOrderByOrderedAtDesc(encounter.getId())) {
                Instant when = order.getOrderedAt() != null ? order.getOrderedAt() : order.getCreatedAt();
                items.add(item(
                        order.getId().toString(),
                        "CLINICAL_ORDER",
                        order.getOrderType() + " order " + (order.getOrderNumber() != null ? order.getOrderNumber() : ""),
                        when,
                        encounter,
                        "ClinicalOrder",
                        order.getId(),
                        Map.of(
                                "orderType", order.getOrderType(),
                                "status", order.getStatus())));
            }
        }

        items.sort(Comparator.comparing(ClinicalTimelineItemResponse::getOccurredAt).reversed());
        return items;
    }

    private Page<ClinicalTimelineItemResponse> pageItems(List<ClinicalTimelineItemResponse> items, Pageable pageable) {
        int start = (int) pageable.getOffset();
        if (start >= items.size()) {
            return new PageImpl<>(List.of(), pageable, items.size());
        }
        int end = Math.min(start + pageable.getPageSize(), items.size());
        return new PageImpl<>(items.subList(start, end), pageable, items.size());
    }

    private PatientProfileEntity requirePatient(UUID tenantId, UUID patientId) {
        return patientProfileRepository.findById(patientId)
                .filter(p -> p.getDeletedAt() == null && p.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient not found"));
    }

    private static ClinicalTimelineItemResponse item(
            String eventId,
            String eventType,
            String summary,
            Instant occurredAt,
            EncounterEntity encounter,
            String referenceType,
            UUID referenceId,
            Map<String, Object> metadata) {
        Map<String, Object> meta = new HashMap<>(metadata);
        return ClinicalTimelineItemResponse.builder()
                .eventId(eventId)
                .eventType(eventType)
                .summary(summary)
                .occurredAt(occurredAt != null ? occurredAt : Instant.now())
                .encounterId(encounter.getId())
                .encounterNumber(encounter.getEncounterNumber())
                .referenceType(referenceType)
                .referenceId(referenceId)
                .metadata(meta)
                .build();
    }

    private static String summarizeVitals(ClinicalVitalSignEntity vital) {
        List<String> parts = new ArrayList<>();
        if (vital.getSystolicBp() != null && vital.getDiastolicBp() != null) {
            parts.add("BP " + vital.getSystolicBp() + "/" + vital.getDiastolicBp());
        }
        if (vital.getHeartRate() != null) {
            parts.add("HR " + vital.getHeartRate());
        }
        if (vital.getTemperature() != null) {
            parts.add("Temp " + vital.getTemperature() + "°C");
        }
        if (vital.getSpo2() != null) {
            parts.add("SpO₂ " + vital.getSpo2() + "%");
        }
        if (vital.getRespiratoryRate() != null) {
            parts.add("RR " + vital.getRespiratoryRate());
        }
        if (vital.getBloodGlucose() != null) {
            parts.add("Glucose " + vital.getBloodGlucose());
        }
        return parts.isEmpty() ? "Clinical vitals recorded" : "Clinical vitals: " + String.join(", ", parts);
    }

    private static Map<String, Object> vitalsMetadata(ClinicalVitalSignEntity vital) {
        Map<String, Object> meta = new HashMap<>();
        if (vital.getSystolicBp() != null) {
            meta.put("systolicBp", vital.getSystolicBp());
        }
        if (vital.getDiastolicBp() != null) {
            meta.put("diastolicBp", vital.getDiastolicBp());
        }
        if (vital.getHeartRate() != null) {
            meta.put("heartRate", vital.getHeartRate());
        }
        if (vital.getTemperature() != null) {
            meta.put("temperature", vital.getTemperature());
        }
        if (vital.getSpo2() != null) {
            meta.put("spo2", vital.getSpo2());
        }
        return meta;
    }
}
