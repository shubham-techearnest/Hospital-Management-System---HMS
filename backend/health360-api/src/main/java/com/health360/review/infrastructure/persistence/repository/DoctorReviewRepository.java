package com.health360.review.infrastructure.persistence.repository;

import com.health360.review.infrastructure.persistence.entity.DoctorReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DoctorReviewRepository extends JpaRepository<DoctorReviewEntity, UUID> {

    Page<DoctorReviewEntity> findByDoctorIdAndVisibleTrueAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID doctorId, Pageable pageable);

    boolean existsByAppointmentId(UUID appointmentId);

    Page<DoctorReviewEntity> findByTenantIdAndVisibleAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, boolean visible, Pageable pageable);

    long countByTenantIdAndVisibleAndDeletedAtIsNull(UUID tenantId, boolean visible);

    @org.springframework.data.jpa.repository.Query("""
            SELECT COALESCE(AVG(r.rating), 0), COUNT(r)
            FROM DoctorReviewEntity r
            WHERE r.doctorId = :doctorId AND r.visible = true
            """)
    Object[] aggregateVisibleRatings(@org.springframework.data.repository.query.Param("doctorId") UUID doctorId);
}
