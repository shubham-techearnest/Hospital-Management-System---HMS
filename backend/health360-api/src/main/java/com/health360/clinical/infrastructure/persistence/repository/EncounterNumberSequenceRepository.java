package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.EncounterNumberSequenceEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EncounterNumberSequenceRepository extends JpaRepository<EncounterNumberSequenceEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s FROM EncounterNumberSequenceEntity s
            WHERE s.tenantId = :tenantId
              AND s.hospitalId = :hospitalId
              AND s.sequenceYear = :sequenceYear
            """)
    Optional<EncounterNumberSequenceEntity> findForUpdate(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("sequenceYear") int sequenceYear);
}
