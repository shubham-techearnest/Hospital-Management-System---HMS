package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.StaffEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffRepository extends JpaRepository<StaffEntity, UUID> {

    Optional<StaffEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<StaffEntity> findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId);

    Optional<StaffEntity> findByUserIdAndHospitalIdAndEmploymentStatusAndDeletedAtIsNull(
            UUID userId, UUID hospitalId, String employmentStatus);

    @Query("""
            SELECT s FROM StaffEntity s
            WHERE s.userId = :userId
              AND s.employmentStatus = 'ACTIVE'
              AND s.deletedAt IS NULL
              AND s.tenantId = :tenantId
            """)
    List<StaffEntity> findActiveAssignmentsForUser(
            @Param("tenantId") UUID tenantId,
            @Param("userId") UUID userId);

    boolean existsByUserIdAndHospitalIdAndEmploymentStatusAndDeletedAtIsNull(
            UUID userId, UUID hospitalId, String employmentStatus);

    long countByTenantIdAndHospitalIdAndEmploymentStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, String employmentStatus);
}
