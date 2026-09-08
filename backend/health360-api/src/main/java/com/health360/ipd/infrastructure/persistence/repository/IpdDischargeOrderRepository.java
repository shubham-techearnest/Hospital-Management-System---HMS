package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdDischargeOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IpdDischargeOrderRepository extends JpaRepository<IpdDischargeOrderEntity, UUID> {
    List<IpdDischargeOrderEntity> findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByOrderedAtDesc(
            UUID tenantId, UUID admissionId);

    Optional<IpdDischargeOrderEntity> findFirstByTenantIdAndAdmissionIdAndStatusAndDeletedAtIsNullOrderByOrderedAtDesc(
            UUID tenantId, UUID admissionId, String status);

    boolean existsByTenantIdAndAdmissionIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID admissionId, String status);

    long countByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, String status);

    @Query("""
            SELECT o FROM IpdDischargeOrderEntity o
            WHERE o.tenantId = :tenantId
              AND o.hospitalId = :hospitalId
              AND o.deletedAt IS NULL
              AND o.orderedAt >= :from
              AND o.orderedAt < :to
            """)
    List<IpdDischargeOrderEntity> findOrdersInRange(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("from") Instant from,
            @Param("to") Instant to);
}
