package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.UhidSequenceEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UhidSequenceRepository extends JpaRepository<UhidSequenceEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s FROM UhidSequenceEntity s
            WHERE s.tenantId = :tenantId AND s.sequenceYear = :sequenceYear
            """)
    Optional<UhidSequenceEntity> findForUpdate(
            @Param("tenantId") UUID tenantId,
            @Param("sequenceYear") int sequenceYear);
}
