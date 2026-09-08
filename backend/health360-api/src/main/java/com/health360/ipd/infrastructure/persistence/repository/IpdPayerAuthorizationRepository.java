package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdPayerAuthorizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IpdPayerAuthorizationRepository extends JpaRepository<IpdPayerAuthorizationEntity, UUID> {

    List<IpdPayerAuthorizationEntity> findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID admissionId);

    Optional<IpdPayerAuthorizationEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByTenantIdAndAdmissionIdAndAuthTypeAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID admissionId, String authType, String status);

    @Query("""
            SELECT a FROM IpdPayerAuthorizationEntity a
            WHERE a.tenantId = :tenantId
              AND a.hospitalId = :hospitalId
              AND a.decidedAt IS NOT NULL
              AND a.requestedAt IS NOT NULL
              AND a.decidedAt >= :from
              AND a.decidedAt < :to
              AND a.deletedAt IS NULL
            """)
    List<IpdPayerAuthorizationEntity> findDecidedInRange(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("from") Instant from,
            @Param("to") Instant to);
}
