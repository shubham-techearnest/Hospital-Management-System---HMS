package com.health360.tasks.infrastructure.persistence.repository;

import com.health360.tasks.infrastructure.persistence.entity.WorkItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkItemRepository extends JpaRepository<WorkItemEntity, UUID> {

    Optional<WorkItemEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    @Query("""
            SELECT w FROM WorkItemEntity w
            WHERE w.tenantId = :tenantId
              AND w.hospitalId = :hospitalId
              AND w.deletedAt IS NULL
              AND (
                    w.assignedUserId = :userId
                 OR (w.assignedUserId IS NULL AND w.assignedRole IN :roles)
              )
              AND (:status IS NULL OR w.status = :status)
            ORDER BY
              CASE w.priority
                WHEN 'URGENT' THEN 0
                WHEN 'HIGH' THEN 1
                WHEN 'NORMAL' THEN 2
                ELSE 3
              END,
              w.dueAt ASC,
              w.createdAt DESC
            """)
    Page<WorkItemEntity> findMyWork(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("userId") UUID userId,
            @Param("roles") java.util.Collection<String> roles,
            @Param("status") String status,
            Pageable pageable);

    Page<WorkItemEntity> findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID tenantId, UUID hospitalId, Pageable pageable);

    @Query("""
            SELECT w FROM WorkItemEntity w
            WHERE w.deletedAt IS NULL
              AND w.status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED')
              AND w.dueAt IS NOT NULL
              AND w.dueAt < :now
              AND (w.escalationDeadline IS NULL OR w.escalationDeadline < :cooldown)
            """)
    List<WorkItemEntity> findOverdueOpenTasks(
            @Param("now") Instant now,
            @Param("cooldown") Instant cooldown);

    List<WorkItemEntity> findByTenantIdAndSourceEntityTypeAndSourceEntityIdAndTaskTypeAndStatusInAndDeletedAtIsNull(
            UUID tenantId,
            String sourceEntityType,
            UUID sourceEntityId,
            String taskType,
            Collection<String> statuses);

    long countByTenantIdAndHospitalIdAndStatusInAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, Collection<String> statuses);

    @Query("""
            SELECT COUNT(w) FROM WorkItemEntity w
            WHERE w.tenantId = :tenantId
              AND w.hospitalId = :hospitalId
              AND w.deletedAt IS NULL
              AND w.status IN :statuses
              AND w.dueAt IS NOT NULL
              AND w.dueAt < :now
            """)
    long countOverdueOpen(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("statuses") Collection<String> statuses,
            @Param("now") Instant now);

    @Query("""
            SELECT COUNT(w) FROM WorkItemEntity w
            WHERE w.tenantId = :tenantId
              AND w.hospitalId = :hospitalId
              AND w.deletedAt IS NULL
              AND w.status IN :statuses
              AND w.dueAt IS NOT NULL
              AND w.dueAt >= :now
              AND w.dueAt < :horizon
            """)
    long countDueSoonOpen(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("statuses") Collection<String> statuses,
            @Param("now") Instant now,
            @Param("horizon") Instant horizon);

    @Query("""
            SELECT COUNT(w) FROM WorkItemEntity w
            WHERE w.tenantId = :tenantId
              AND w.hospitalId = :hospitalId
              AND w.deletedAt IS NULL
              AND (
                    w.assignedUserId = :userId
                 OR (w.assignedUserId IS NULL AND w.assignedRole IN :roles)
              )
              AND w.status IN :statuses
              AND (
                    (:queue = 'URGENT' AND w.priority IN ('URGENT', 'HIGH'))
                 OR (:queue = 'OVERDUE' AND w.dueAt IS NOT NULL AND w.dueAt < :now)
                 OR (:queue = 'TODAY' AND w.dueAt IS NOT NULL AND w.dueAt >= :dayStart AND w.dueAt < :dayEnd)
                 OR (:queue = 'PENDING' AND w.status IN ('PENDING', 'ASSIGNED'))
                 OR (:queue = 'ALL')
              )
            """)
    long countMyWorkQueue(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("userId") UUID userId,
            @Param("roles") Collection<String> roles,
            @Param("statuses") Collection<String> statuses,
            @Param("queue") String queue,
            @Param("now") Instant now,
            @Param("dayStart") Instant dayStart,
            @Param("dayEnd") Instant dayEnd);

    @Query("""
            SELECT w FROM WorkItemEntity w
            WHERE w.tenantId = :tenantId
              AND w.hospitalId = :hospitalId
              AND w.deletedAt IS NULL
              AND (
                    w.assignedUserId = :userId
                 OR (w.assignedUserId IS NULL AND w.assignedRole IN :roles)
              )
              AND w.status IN :statuses
              AND (
                    (:queue = 'URGENT' AND w.priority IN ('URGENT', 'HIGH'))
                 OR (:queue = 'OVERDUE' AND w.dueAt IS NOT NULL AND w.dueAt < :now)
                 OR (:queue = 'TODAY' AND w.dueAt IS NOT NULL AND w.dueAt >= :dayStart AND w.dueAt < :dayEnd)
                 OR (:queue = 'PENDING' AND w.status IN ('PENDING', 'ASSIGNED'))
                 OR (:queue = 'ALL')
              )
            ORDER BY
              CASE w.priority
                WHEN 'URGENT' THEN 0
                WHEN 'HIGH' THEN 1
                WHEN 'NORMAL' THEN 2
                ELSE 3
              END,
              w.dueAt ASC,
              w.createdAt DESC
            """)
    Page<WorkItemEntity> findMyWorkQueue(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("userId") UUID userId,
            @Param("roles") Collection<String> roles,
            @Param("statuses") Collection<String> statuses,
            @Param("queue") String queue,
            @Param("now") Instant now,
            @Param("dayStart") Instant dayStart,
            @Param("dayEnd") Instant dayEnd,
            Pageable pageable);
}
