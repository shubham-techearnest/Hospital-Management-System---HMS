package com.health360.predictive.infrastructure.persistence.repository;

import com.health360.predictive.infrastructure.persistence.entity.PredictiveInsightEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PredictiveInsightRepository extends JpaRepository<PredictiveInsightEntity, UUID> {

    Optional<PredictiveInsightEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<PredictiveInsightEntity> findByHospitalIdAndBranchIdAndInsightTypeAndStatusAndDeletedAtIsNull(
            UUID hospitalId, UUID branchId, String insightType, String status);

    List<PredictiveInsightEntity> findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByScoreDescGeneratedAtDesc(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndSeverityAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status, String severity);

    long countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, UUID branchId, String status);
}
