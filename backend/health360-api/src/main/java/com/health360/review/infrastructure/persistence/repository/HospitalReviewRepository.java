package com.health360.review.infrastructure.persistence.repository;

import com.health360.review.infrastructure.persistence.entity.HospitalReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HospitalReviewRepository extends JpaRepository<HospitalReviewEntity, UUID> {

    Page<HospitalReviewEntity> findByHospitalIdAndVisibleTrueAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID hospitalId, Pageable pageable);

    boolean existsByAppointmentId(UUID appointmentId);

    Page<HospitalReviewEntity> findByTenantIdAndVisibleAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, boolean visible, Pageable pageable);

    long countByTenantIdAndVisibleAndDeletedAtIsNull(UUID tenantId, boolean visible);

    @org.springframework.data.jpa.repository.Query("""
            SELECT COALESCE(AVG(r.rating), 0), COUNT(r)
            FROM HospitalReviewEntity r
            WHERE r.hospitalId = :hospitalId AND r.visible = true
            """)
    Object[] aggregateVisibleRatings(@org.springframework.data.repository.query.Param("hospitalId") UUID hospitalId);
}
