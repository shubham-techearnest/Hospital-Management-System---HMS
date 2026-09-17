package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.OnboardingRequestEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface OnboardingRequestRepository extends JpaRepository<OnboardingRequestEntity, UUID> {

    @Query("""
            SELECT r FROM OnboardingRequestEntity r
            WHERE r.tenantId = :tenantId
              AND (:status IS NULL OR r.status = :status)
              AND (:requestType IS NULL OR r.requestType = :requestType)
            """)
    Page<OnboardingRequestEntity> search(
            @Param("tenantId") UUID tenantId,
            @Param("status") String status,
            @Param("requestType") String requestType,
            Pageable pageable);

    boolean existsByTenantIdAndEmailIgnoreCaseAndRequestTypeAndStatus(
            UUID tenantId, String email, String requestType, String status);
}
