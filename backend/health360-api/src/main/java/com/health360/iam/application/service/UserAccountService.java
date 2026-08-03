package com.health360.iam.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.PermissionRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRoleRepository;
import com.health360.iam.presentation.dto.request.UpdateUserProfileRequest;
import com.health360.iam.presentation.dto.response.UserProfileResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PermissionRepository permissionRepository;
    private final UserProfileMapper userProfileMapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(UUID userId, UUID tenantId) {
        UserEntity user = requireUser(userId, tenantId);
        return toProfile(user);
    }

    @Transactional
    public UserProfileResponse updateCurrentUser(UUID userId, UUID tenantId, UpdateUserProfileRequest request) {
        UserEntity user = requireUser(userId, tenantId);

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim().isEmpty() ? null : request.getAvatarUrl().trim());
        }
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone().trim());
        }
        if (request.getLocale() != null) {
            user.setLocale(request.getLocale().trim());
        }
        user.touch();
        userRepository.save(user);

        auditLogService.record(tenantId, userId, "PROFILE_UPDATED", "User", userId,
                Map.of("email", user.getEmail()));

        return toProfile(user);
    }

    public UserEntity requireUser(UUID userId, UUID tenantId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "User not found"));
        if (!user.getTenantId().equals(tenantId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        return user;
    }

    private UserProfileResponse toProfile(UserEntity user) {
        List<String> roles = userRoleRepository.findRoleNamesByUserId(user.getId());
        List<String> permissions = permissionRepository.findPermissionCodesByUserId(user.getId());
        return userProfileMapper.toResponse(user, roles, permissions);
    }
}
