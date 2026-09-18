package com.health360.shared.application;

import com.health360.config.security.SecurityUtils;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.infrastructure.persistence.AuditLogEntity;
import com.health360.shared.infrastructure.persistence.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void record(UUID tenantId, UUID userId, String action, String entityType, UUID entityId,
                       Map<String, Object> newValue) {
        record(tenantId, userId, action, entityType, entityId, null, newValue);
    }

    @Transactional
    public void record(UUID tenantId, UUID userId, String action, String entityType, UUID entityId,
                       Map<String, Object> oldValue, Map<String, Object> newValue) {
        HttpServletRequest request = currentRequest();
        UserPrincipal principal = SecurityUtils.currentPrincipal().orElse(null);

        Map<String, Object> enrichedNewValue = newValue;
        UUID actorUserId = null;
        UUID impersonationSessionId = null;
        if (principal != null && principal.isImpersonating()) {
            actorUserId = principal.getActorUserId();
            impersonationSessionId = principal.getImpersonationSessionId();
            enrichedNewValue = new HashMap<>();
            if (newValue != null) {
                enrichedNewValue.putAll(newValue);
            }
            enrichedNewValue.putIfAbsent("performedThroughImpersonation", true);
            enrichedNewValue.putIfAbsent("actorUserId", actorUserId.toString());
            enrichedNewValue.putIfAbsent("impersonationSessionId", impersonationSessionId.toString());
            enrichedNewValue.putIfAbsent("effectiveUserId", principal.getUserId().toString());
        }

        AuditLogEntity entry = AuditLogEntity.builder()
                .tenantId(tenantId)
                .userId(userId)
                .actorUserId(actorUserId)
                .impersonationSessionId(impersonationSessionId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(enrichedNewValue)
                .ipAddress(request != null ? request.getRemoteAddr() : null)
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .occurredAt(Instant.now())
                .build();

        auditLogRepository.save(entry);
    }

    private HttpServletRequest currentRequest() {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }
}
