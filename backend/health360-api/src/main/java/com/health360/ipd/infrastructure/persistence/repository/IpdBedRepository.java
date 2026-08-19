package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdBedEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IpdBedRepository extends JpaRepository<IpdBedEntity, UUID> {

    List<IpdBedEntity> findByTenantIdAndRoomIdAndDeletedAtIsNullOrderByBedNumberAsc(UUID tenantId, UUID roomId);

    Optional<IpdBedEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    @Query("""
            SELECT b FROM IpdBedEntity b
            JOIN IpdRoomEntity r ON r.id = b.roomId
            JOIN IpdWardEntity w ON w.id = r.wardId
            WHERE b.tenantId = :tenantId
              AND w.hospitalId = :hospitalId
              AND w.branchId = :branchId
              AND b.deletedAt IS NULL
              AND (:status IS NULL OR b.status = :status)
            ORDER BY w.code, r.code, b.bedNumber
            """)
    List<IpdBedEntity> findByHospitalBranch(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId,
            @Param("status") String status);

    boolean existsByRoomIdAndBedNumberAndDeletedAtIsNull(UUID roomId, String bedNumber);

    @Query("""
            SELECT COUNT(b) FROM IpdBedEntity b
            JOIN IpdRoomEntity r ON r.id = b.roomId
            JOIN IpdWardEntity w ON w.id = r.wardId
            WHERE b.tenantId = :tenantId
              AND w.hospitalId = :hospitalId
              AND w.branchId = :branchId
              AND b.deletedAt IS NULL
              AND (:status IS NULL OR b.status = :status)
            """)
    long countByHospitalBranch(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId,
            @Param("status") String status);
}
