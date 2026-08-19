package com.health360.ot.infrastructure.persistence.repository;

import com.health360.ot.infrastructure.persistence.entity.OtScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface OtScheduleRepository extends JpaRepository<OtScheduleEntity, UUID> {

    Optional<OtScheduleEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    @Query("""
            SELECT COUNT(s) FROM OtScheduleEntity s
            WHERE s.theatreId = :theatreId
              AND s.deletedAt IS NULL
              AND s.status IN ('SCHEDULED', 'IN_USE')
              AND s.scheduledStart < :end
              AND s.scheduledEnd > :start
              AND (:excludeScheduleId IS NULL OR s.id <> :excludeScheduleId)
            """)
    long countConflictingSchedules(
            @Param("theatreId") UUID theatreId,
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("excludeScheduleId") UUID excludeScheduleId);
}
