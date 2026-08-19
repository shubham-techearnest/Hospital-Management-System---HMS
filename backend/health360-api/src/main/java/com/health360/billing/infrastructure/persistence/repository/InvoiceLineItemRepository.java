package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.InvoiceLineItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvoiceLineItemRepository extends JpaRepository<InvoiceLineItemEntity, UUID> {

    List<InvoiceLineItemEntity> findByInvoiceIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID invoiceId);
}
