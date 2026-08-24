package com.health360.iam.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.infrastructure.persistence.entity.InAppNotificationEntity;
import com.health360.iam.infrastructure.persistence.repository.InAppNotificationRepository;
import com.health360.iam.presentation.dto.response.InAppNotificationResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InAppNotificationService {

    private static final int DEFAULT_LIMIT = 50;

    private final InAppNotificationRepository inAppNotificationRepository;

    @Transactional(readOnly = true)
    public List<InAppNotificationResponse> listMyNotifications(UserPrincipal principal) {
        return inAppNotificationRepository
                .findByTenantIdAndUserIdOrderByCreatedAtDesc(
                        principal.getTenantId(),
                        principal.getUserId(),
                        PageRequest.of(0, DEFAULT_LIMIT))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public InAppNotificationResponse markRead(UserPrincipal principal, UUID notificationId) {
        InAppNotificationEntity notification = inAppNotificationRepository
                .findByIdAndTenantIdAndUserId(notificationId, principal.getTenantId(), principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            inAppNotificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    private InAppNotificationResponse toResponse(InAppNotificationEntity entity) {
        return InAppNotificationResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .notificationType(entity.getNotificationType())
                .read(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .referenceType(entity.getReferenceType())
                .referenceId(entity.getReferenceId())
                .build();
    }
}
