package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.HealthTimelineEventEntity;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.HealthTimelineEventRepository;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.presentation.dto.response.HealthTimelineEventResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HealthTimelineService {

    private final HealthTimelineEventRepository healthTimelineEventRepository;
    private final PatientProfileRepository patientProfileRepository;

    @Transactional
    public void recordEvent(
            UUID tenantId,
            UUID patientId,
            String eventType,
            String summary,
            String referenceType,
            UUID referenceId,
            Instant occurredAt,
            Map<String, Object> metadata) {
        HealthTimelineEventEntity event = new HealthTimelineEventEntity();
        event.setTenantId(tenantId);
        event.setPatientId(patientId);
        event.setEventType(eventType);
        event.setSummary(summary);
        event.setReferenceType(referenceType);
        event.setReferenceId(referenceId);
        event.setOccurredAt(occurredAt != null ? occurredAt : Instant.now());
        event.setMetadata(metadata);
        healthTimelineEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public Page<HealthTimelineEventResponse> getTimeline(UUID userId, UUID tenantId, Pageable pageable) {
        UUID patientId = requireConsentedProfile(userId, tenantId).getId();
        return healthTimelineEventRepository.findByPatientIdOrderByOccurredAtDesc(patientId, pageable)
                .map(this::toResponse);
    }

    private PatientProfileEntity requireConsentedProfile(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = patientProfileRepository
                .findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient profile not found"));
        if (!profile.isConsentAccepted()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Health data consent must be accepted before accessing profile");
        }
        return profile;
    }

    private HealthTimelineEventResponse toResponse(HealthTimelineEventEntity event) {
        return HealthTimelineEventResponse.builder()
                .id(event.getId())
                .eventType(event.getEventType())
                .summary(event.getSummary())
                .metadata(event.getMetadata())
                .referenceType(event.getReferenceType())
                .referenceId(event.getReferenceId())
                .occurredAt(event.getOccurredAt())
                .build();
    }
}
