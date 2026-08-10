package com.health360.hospital.application.service;

import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.hospital.presentation.dto.request.UpdateHospitalStatusRequest;
import com.health360.hospital.presentation.dto.response.AdminHospitalResponse;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.domain.SubscriptionStatus;
import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.health360.subscription.infrastructure.persistence.repository.HospitalSubscriptionRepository;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminHospitalService {

    private static final List<String> ACTIVE_SUBSCRIPTION_STATUSES = List.of(
            SubscriptionStatus.ACTIVE.name(),
            SubscriptionStatus.TRIAL.name());

    private final HospitalRepository hospitalRepository;
    private final HospitalAssociationRepository associationRepository;
    private final HospitalSubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<AdminHospitalResponse> searchHospitals(
            UUID tenantId, String name, String status, Pageable pageable) {
        Page<HospitalEntity> page = resolveSearch(tenantId, name, status, pageable);
        Map<UUID, UserEntity> admins = loadAdminUsers(page.getContent());
        Map<UUID, AdminHospitalResponse.SubscriptionSummary> subscriptions =
                loadSubscriptionSummaries(page.getContent(), tenantId);

        return page.map(hospital -> toResponse(
                hospital,
                admins.get(hospital.getAdminUserId()),
                subscriptions.get(hospital.getId()),
                countActiveDoctors(hospital.getId())));
    }

    @Transactional(readOnly = true)
    public AdminHospitalResponse getHospital(UUID tenantId, UUID hospitalId) {
        HospitalEntity hospital = requireHospital(tenantId, hospitalId);
        UserEntity admin = userRepository.findById(hospital.getAdminUserId()).orElse(null);
        AdminHospitalResponse.SubscriptionSummary subscription =
                loadSubscriptionSummary(hospital.getId(), tenantId);
        return toResponse(hospital, admin, subscription, countActiveDoctors(hospital.getId()));
    }

    @Transactional
    public AdminHospitalResponse updateHospitalStatus(
            UUID tenantId, UUID actorId, UUID hospitalId, UpdateHospitalStatusRequest request) {
        HospitalEntity hospital = requireHospital(tenantId, hospitalId);
        String newStatus = request.getStatus().trim().toUpperCase();
        hospital.setStatus(newStatus);
        hospital.setUpdatedBy(actorId);
        hospital.touch();
        hospitalRepository.save(hospital);

        auditLogService.record(tenantId, actorId, "HOSPITAL_STATUS_UPDATED", "Hospital", hospitalId,
                Map.of("status", newStatus));

        UserEntity admin = userRepository.findById(hospital.getAdminUserId()).orElse(null);
        return toResponse(
                hospital,
                admin,
                loadSubscriptionSummary(hospital.getId(), tenantId),
                countActiveDoctors(hospital.getId()));
    }

    @Transactional(readOnly = true)
    public HospitalEntity requireHospital(UUID tenantId, UUID hospitalId) {
        return hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Hospital not found"));
    }

    private Page<HospitalEntity> resolveSearch(UUID tenantId, String name, String status, Pageable pageable) {
        String normalizedName = blankToNull(name);
        String normalizedStatus = blankToNull(status);
        if (normalizedName != null && normalizedStatus != null) {
            return hospitalRepository.findByTenantIdAndDeletedAtIsNullAndNameContainingIgnoreCaseAndStatus(
                    tenantId, normalizedName, normalizedStatus, pageable);
        }
        if (normalizedName != null) {
            return hospitalRepository.findByTenantIdAndDeletedAtIsNullAndNameContainingIgnoreCase(
                    tenantId, normalizedName, pageable);
        }
        if (normalizedStatus != null) {
            return hospitalRepository.findByTenantIdAndDeletedAtIsNullAndStatus(
                    tenantId, normalizedStatus, pageable);
        }
        return hospitalRepository.findByTenantIdAndDeletedAtIsNull(tenantId, pageable);
    }

    private Map<UUID, UserEntity> loadAdminUsers(List<HospitalEntity> hospitals) {
        List<UUID> adminIds = hospitals.stream().map(HospitalEntity::getAdminUserId).distinct().toList();
        return userRepository.findAllById(adminIds).stream()
                .collect(Collectors.toMap(UserEntity::getId, u -> u));
    }

    private Map<UUID, AdminHospitalResponse.SubscriptionSummary> loadSubscriptionSummaries(
            List<HospitalEntity> hospitals, UUID tenantId) {
        return hospitals.stream()
                .map(HospitalEntity::getId)
                .distinct()
                .collect(Collectors.toMap(id -> id, id -> loadSubscriptionSummary(id, tenantId)));
    }

    private AdminHospitalResponse.SubscriptionSummary loadSubscriptionSummary(UUID hospitalId, UUID tenantId) {
        return subscriptionRepository
                .findByHospitalIdAndTenantIdAndStatusIn(hospitalId, tenantId, ACTIVE_SUBSCRIPTION_STATUSES)
                .map(sub -> {
                    SubscriptionPlanEntity plan = planRepository.findById(sub.getPlanId()).orElse(null);
                    return AdminHospitalResponse.SubscriptionSummary.builder()
                            .subscriptionId(sub.getId())
                            .planCode(plan != null ? plan.getCode() : null)
                            .planName(plan != null ? plan.getName() : null)
                            .status(sub.getStatus())
                            .build();
                })
                .orElse(null);
    }

    private long countActiveDoctors(UUID hospitalId) {
        return associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(hospitalId)
                .stream()
                .filter(a -> "ACTIVE".equals(a.getStatus()))
                .map(a -> a.getDoctorId())
                .distinct()
                .count();
    }

    private AdminHospitalResponse toResponse(
            HospitalEntity hospital,
            UserEntity admin,
            AdminHospitalResponse.SubscriptionSummary subscription,
            long doctorCount) {
        return AdminHospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .registrationNumber(hospital.getRegistrationNumber())
                .hospitalType(hospital.getHospitalType())
                .status(hospital.getStatus())
                .adminUserId(hospital.getAdminUserId())
                .adminEmail(admin != null ? admin.getEmail() : null)
                .adminName(admin != null ? admin.getFirstName() + " " + admin.getLastName() : null)
                .doctorCount((int) doctorCount)
                .subscription(subscription)
                .createdAt(hospital.getCreatedAt())
                .updatedAt(hospital.getUpdatedAt())
                .build();
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
