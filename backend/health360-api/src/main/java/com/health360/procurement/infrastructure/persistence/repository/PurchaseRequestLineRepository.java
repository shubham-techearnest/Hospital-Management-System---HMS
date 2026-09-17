package com.health360.procurement.infrastructure.persistence.repository;

import com.health360.procurement.infrastructure.persistence.entity.PurchaseRequestLineEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PurchaseRequestLineRepository extends JpaRepository<PurchaseRequestLineEntity, UUID> {

    List<PurchaseRequestLineEntity> findByPurchaseRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID purchaseRequestId);
}
