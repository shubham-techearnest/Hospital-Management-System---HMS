package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.ImpersonationSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ImpersonationSessionRepository extends JpaRepository<ImpersonationSessionEntity, UUID> {

    @Query("""
            SELECT s FROM ImpersonationSessionEntity s
            WHERE s.actorUserId = :actorUserId AND s.status = 'ACTIVE'
            ORDER BY s.startedAt DESC
            """)
    Optional<ImpersonationSessionEntity> findActiveByActor(@Param("actorUserId") UUID actorUserId);

    @Query("""
            SELECT s FROM ImpersonationSessionEntity s
            WHERE s.id = :id AND s.status = 'ACTIVE'
            """)
    Optional<ImpersonationSessionEntity> findActiveById(@Param("id") UUID id);
}
