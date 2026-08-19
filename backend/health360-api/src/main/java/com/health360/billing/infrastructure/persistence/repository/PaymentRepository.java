package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    List<PaymentEntity> findByInvoiceIdAndDeletedAtIsNullOrderByPaidAtDesc(UUID invoiceId);
}
