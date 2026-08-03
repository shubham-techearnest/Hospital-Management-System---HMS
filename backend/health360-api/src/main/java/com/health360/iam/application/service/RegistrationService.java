package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import com.health360.doctor.application.service.DoctorProfileProvisioningService;
import com.health360.iam.domain.RegistrationRole;
import com.health360.iam.domain.UserStatus;
import com.health360.iam.infrastructure.persistence.entity.RoleEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.entity.UserRoleEntity;
import com.health360.iam.infrastructure.persistence.repository.RoleRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRoleRepository;
import com.health360.iam.presentation.dto.request.RegisterRequest;
import com.health360.iam.presentation.dto.response.RegisterResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final NotificationPreferenceService notificationPreferenceService;
    private final AuditLogService auditLogService;
    private final Health360Properties properties;
    private final DoctorProfileProvisioningService doctorProfileProvisioningService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        UUID tenantId = properties.getDefaultTenantId();

        if (userRepository.existsByTenantIdAndEmailIgnoreCase(tenantId, request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL, HttpStatus.CONFLICT,
                    "Email is already registered");
        }

        RoleEntity role = roleRepository.findByTenantIdAndName(tenantId, request.getRole().name())
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                        "Default role not configured"));

        UserEntity user = new UserEntity();
        user.setTenantId(tenantId);
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone().trim());
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setEmailVerified(false);
        UserEntity savedUser = userRepository.saveAndFlush(user);

        UserRoleEntity userRole = new UserRoleEntity();
        userRole.setTenantId(tenantId);
        userRole.setUserId(savedUser.getId());
        userRole.setRoleId(role.getId());
        userRoleRepository.save(userRole);

        emailVerificationService.createAndSendVerificationToken(savedUser);
        notificationPreferenceService.seedDefaultsForUser(savedUser);

        if (RegistrationRole.DOCTOR.equals(request.getRole())) {
            doctorProfileProvisioningService.ensureProfileEntity(savedUser.getId(), tenantId);
        }

        auditLogService.record(tenantId, savedUser.getId(), "USER_REGISTERED", "User", savedUser.getId(),
                Map.of("email", savedUser.getEmail(), "role", request.getRole().name()));

        return RegisterResponse.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .status(savedUser.getStatus())
                .message("Verification email sent")
                .build();
    }
}
