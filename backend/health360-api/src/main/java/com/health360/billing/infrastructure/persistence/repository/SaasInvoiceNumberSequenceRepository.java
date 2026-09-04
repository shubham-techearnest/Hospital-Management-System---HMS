package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.SaasInvoiceNumberSequenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface SaasInvoiceNumberSequenceRepository
        extends JpaRepository<SaasInvoiceNumberSequenceEntity, SaasInvoiceNumberSequenceEntity.Pk> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SaasInvoiceNumberSequenceEntity s WHERE s.hospitalId = :hospitalId AND s.year = :year")
    Optional<SaasInvoiceNumberSequenceEntity> findForUpdate(
            @Param("hospitalId") UUID hospitalId, @Param("year") int year);
}
