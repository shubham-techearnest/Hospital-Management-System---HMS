package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import com.health360.hospital.application.service.IndividualPracticeProvisioningService;
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
    private final IndividualPracticeProvisioningService individualPracticeProvisioningService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        UUID tenantId = properties.getDefaultTenantId();

        if (userRepository.existsByTenantIdAndEmailIgnoreCase(tenantId, request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL, HttpStatus.CONFLICT,
                    "Email is already registered");
        }

        RegistrationRole registrationRole = request.getRole();
        if (registrationRole == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Role is required");
        }

        UserEntity savedUser = createUser(request, tenantId);

        switch (registrationRole) {
            case PATIENT -> assignRole(tenantId, savedUser.getId(), "PATIENT");
            case INDIVIDUAL_PRACTICE -> {
                assignRole(tenantId, savedUser.getId(), "DOCTOR");
                individualPracticeProvisioningService.provision(
                        savedUser.getId(), tenantId, request.getClinicName().trim());
            }
            default -> throw new BusinessException(ErrorCode.DOCTOR_REGISTRATION_DISABLED, HttpStatus.FORBIDDEN,
                    "Doctor registration is by invitation only. Register as an individual practice or contact your hospital administrator.");
        }

        emailVerificationService.createAndSendVerificationToken(savedUser);
        notificationPreferenceService.seedDefaultsForUser(savedUser);

        auditLogService.record(tenantId, savedUser.getId(), "USER_REGISTERED", "User", savedUser.getId(),
                Map.of("email", savedUser.getEmail(), "role", registrationRole.name()));

        return RegisterResponse.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .status(savedUser.getStatus())
                .message("Verification email sent")
                .build();
    }

    private UserEntity createUser(RegisterRequest request, UUID tenantId) {
        UserEntity user = new UserEntity();
        user.setTenantId(tenantId);
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone().trim());
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setEmailVerified(false);
        return userRepository.saveAndFlush(user);
    }

    private void assignRole(UUID tenantId, UUID userId, String roleName) {
        RoleEntity role = roleRepository.findByTenantIdAndName(tenantId, roleName)
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                        "Default role not configured: " + roleName));
        UserRoleEntity userRole = new UserRoleEntity();
        userRole.setTenantId(tenantId);
        userRole.setUserId(userId);
        userRole.setRoleId(role.getId());
        userRoleRepository.save(userRole);
    }
}
