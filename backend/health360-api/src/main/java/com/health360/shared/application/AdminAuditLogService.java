package com.health360.shared.application;

import com.health360.shared.infrastructure.persistence.AuditLogEntity;
import com.health360.shared.infrastructure.persistence.AuditLogRepository;
import com.health360.shared.presentation.dto.response.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminAuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> listAuditLogs(
            UUID tenantId, String action, String entityType, UUID entityId, Pageable pageable) {
        Page<AuditLogEntity> page;
        if (action != null && !action.isBlank()) {
            page = auditLogRepository.findByTenantIdAndActionContainingIgnoreCaseOrderByOccurredAtDesc(
                    tenantId, action.trim(), pageable);
        } else if (entityType != null && !entityType.isBlank() && entityId != null) {
            page = auditLogRepository.findByTenantIdAndEntityTypeAndEntityIdOrderByOccurredAtDesc(
                    tenantId, entityType.trim(), entityId, pageable);
        } else {
            page = auditLogRepository.findByTenantIdOrderByOccurredAtDesc(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    private AuditLogResponse toResponse(AuditLogEntity entity) {
        return AuditLogResponse.builder()
                .id(entity.getId())
                .tenantId(entity.getTenantId())
                .userId(entity.getUserId())
                .action(entity.getAction())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .oldValue(entity.getOldValue())
                .newValue(entity.getNewValue())
                .ipAddress(entity.getIpAddress())
                .occurredAt(entity.getOccurredAt())
                .build();
    }
}
