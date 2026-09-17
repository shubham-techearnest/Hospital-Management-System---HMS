package com.health360.procurement.infrastructure.persistence.repository;

import com.health360.procurement.infrastructure.persistence.entity.PurchaseOrderLineEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PurchaseOrderLineRepository extends JpaRepository<PurchaseOrderLineEntity, UUID> {

    List<PurchaseOrderLineEntity> findByPurchaseOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID purchaseOrderId);
}
