package com.health360.iam.application.service;

import com.health360.iam.domain.UserStatus;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRoleRepository;
import com.health360.iam.presentation.dto.request.UpdateUserStatusRequest;
import com.health360.iam.presentation.dto.response.AdminUserResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RefreshTokenService refreshTokenService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> searchUsers(
            UUID tenantId,
            String email,
            String name,
            String role,
            String status,
            Pageable pageable) {
        return userRepository.searchAdminUsers(tenantId, email, name, role, status, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(UUID tenantId, UUID userId) {
        UserEntity user = requireTenantUser(tenantId, userId);
        return toResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUserStatus(
            UUID tenantId, UUID adminUserId, UUID userId, UpdateUserStatusRequest request) {
        UserEntity user = requireTenantUser(tenantId, userId);
        String newStatus = request.getStatus().trim().toUpperCase();

        if (!List.of(UserStatus.ACTIVE, UserStatus.DEACTIVATED, UserStatus.LOCKED).contains(newStatus)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid user status");
        }

        user.setStatus(newStatus);
        user.touch();
        user.setUpdatedBy(adminUserId);
        userRepository.save(user);

        if (UserStatus.DEACTIVATED.equals(newStatus)) {
            refreshTokenService.revokeAllForUser(userId);
        }

        auditLogService.record(tenantId, adminUserId, "USER_STATUS_UPDATED", "User", userId,
                Map.of("status", newStatus));

        return toResponse(user);
    }

    private UserEntity requireTenantUser(UUID tenantId, UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "User not found"));
        if (!user.getTenantId().equals(tenantId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        return user;
    }

    private AdminUserResponse toResponse(UserEntity user) {
        List<String> roles = userRoleRepository.findRoleNamesByUserId(user.getId());
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
