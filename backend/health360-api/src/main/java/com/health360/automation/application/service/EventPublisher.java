package com.health360.automation.application.service;

import com.health360.automation.infrastructure.persistence.entity.DomainEventOutboxEntity;
import com.health360.automation.infrastructure.persistence.entity.HospitalEventEntity;
import com.health360.automation.infrastructure.persistence.repository.DomainEventOutboxRepository;
import com.health360.automation.infrastructure.persistence.repository.HospitalEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventPublisher {

    private final DomainEventOutboxRepository outboxRepository;
    private final HospitalEventRepository hospitalEventRepository;
    private final AutomationReactor automationReactor;

    @Transactional
    public HospitalEventEntity publish(PublishRequest request) {
        Instant occurredAt = request.occurredAt() != null ? request.occurredAt() : Instant.now();
        Map<String, Object> payload = request.payload() != null
                ? new HashMap<>(request.payload())
                : new HashMap<>();

        DomainEventOutboxEntity outbox = new DomainEventOutboxEntity();
        outbox.setTenantId(request.tenantId());
        outbox.setEventType(request.eventType());
        outbox.setAggregateType(request.entityType());
        outbox.setAggregateId(request.entityId());
        outbox.setPayload(payload);
        outbox.setOccurredAt(occurredAt);
        outboxRepository.save(outbox);

        HospitalEventEntity event = new HospitalEventEntity();
        event.setTenantId(request.tenantId());
        event.setHospitalId(request.hospitalId());
        event.setBranchId(request.branchId());
        event.setEventType(request.eventType());
        event.setPatientId(request.patientId());
        event.setEncounterId(request.encounterId());
        event.setUserId(request.userId());
        event.setEntityType(request.entityType());
        event.setEntityId(request.entityId());
        event.setCorrelationId(request.correlationId());
        event.setSourceModule(request.sourceModule());
        event.setPayload(payload);
        event.setOccurredAt(occurredAt);
        event.setCreatedBy(request.userId());
        event.setUpdatedBy(request.userId());
        HospitalEventEntity saved = hospitalEventRepository.save(event);

        automationReactor.onEvent(saved);
        return saved;
    }

    public record PublishRequest(
            UUID tenantId,
            UUID hospitalId,
            UUID branchId,
            String eventType,
            UUID patientId,
            UUID encounterId,
            UUID userId,
            String entityType,
            UUID entityId,
            UUID correlationId,
            String sourceModule,
            Map<String, Object> payload,
            Instant occurredAt
    ) {
        public static Builder builder() {
            return new Builder();
        }

        public static final class Builder {
            private UUID tenantId;
            private UUID hospitalId;
            private UUID branchId;
            private String eventType;
            private UUID patientId;
            private UUID encounterId;
            private UUID userId;
            private String entityType;
            private UUID entityId;
            private UUID correlationId;
            private String sourceModule;
            private Map<String, Object> payload;
            private Instant occurredAt;

            public Builder tenantId(UUID tenantId) {
                this.tenantId = tenantId;
                return this;
            }

            public Builder hospitalId(UUID hospitalId) {
                this.hospitalId = hospitalId;
                return this;
            }

            public Builder branchId(UUID branchId) {
                this.branchId = branchId;
                return this;
            }

            public Builder eventType(String eventType) {
                this.eventType = eventType;
                return this;
            }

            public Builder patientId(UUID patientId) {
                this.patientId = patientId;
                return this;
            }

            public Builder encounterId(UUID encounterId) {
                this.encounterId = encounterId;
                return this;
            }

            public Builder userId(UUID userId) {
                this.userId = userId;
                return this;
            }

            public Builder entityType(String entityType) {
                this.entityType = entityType;
                return this;
            }

            public Builder entityId(UUID entityId) {
                this.entityId = entityId;
                return this;
            }

            public Builder correlationId(UUID correlationId) {
                this.correlationId = correlationId;
                return this;
            }

            public Builder sourceModule(String sourceModule) {
                this.sourceModule = sourceModule;
                return this;
            }

            public Builder payload(Map<String, Object> payload) {
                this.payload = payload;
                return this;
            }

            public Builder occurredAt(Instant occurredAt) {
                this.occurredAt = occurredAt;
                return this;
            }

            public PublishRequest build() {
                return new PublishRequest(
                        tenantId, hospitalId, branchId, eventType, patientId, encounterId, userId,
                        entityType, entityId, correlationId, sourceModule, payload, occurredAt);
            }
        }
    }
}
