package com.health360.opd.infrastructure.persistence.repository;

import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OpdQueueEntryRepository extends JpaRepository<OpdQueueEntryEntity, UUID> {

    Optional<OpdQueueEntryEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByTenantIdAndEncounterIdAndDeletedAtIsNull(UUID tenantId, UUID encounterId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT COALESCE(MAX(q.tokenNumber), 0)
            FROM OpdQueueEntryEntity q
            WHERE q.hospitalId = :hospitalId
              AND q.branchId = :branchId
              AND q.queueDate = :queueDate
              AND q.deletedAt IS NULL
            """)
    int findMaxTokenNumberForDay(
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId,
            @Param("queueDate") LocalDate queueDate);

    @Query("""
            SELECT q FROM OpdQueueEntryEntity q
            WHERE q.tenantId = :tenantId
              AND q.hospitalId = :hospitalId
              AND q.branchId = :branchId
              AND q.queueDate = :queueDate
              AND q.deletedAt IS NULL
              AND (:status IS NULL OR q.status = :status)
              AND (:deskId IS NULL OR q.deskId = :deskId)
            ORDER BY q.priority DESC, q.tokenNumber ASC
            """)
    List<OpdQueueEntryEntity> findQueue(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("branchId") UUID branchId,
            @Param("queueDate") LocalDate queueDate,
            @Param("status") String status,
            @Param("deskId") UUID deskId);
}
