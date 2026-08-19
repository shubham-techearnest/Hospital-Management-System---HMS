package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.InvoiceNumberSequenceEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface InvoiceNumberSequenceRepository extends JpaRepository<InvoiceNumberSequenceEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s FROM InvoiceNumberSequenceEntity s
            WHERE s.tenantId = :tenantId
              AND s.hospitalId = :hospitalId
              AND s.sequenceYear = :sequenceYear
            """)
    Optional<InvoiceNumberSequenceEntity> findForUpdate(
            @Param("tenantId") UUID tenantId,
            @Param("hospitalId") UUID hospitalId,
            @Param("sequenceYear") int sequenceYear);
}
