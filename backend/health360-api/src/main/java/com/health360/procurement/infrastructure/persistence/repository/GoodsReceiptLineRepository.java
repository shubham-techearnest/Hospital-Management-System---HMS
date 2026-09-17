package com.health360.procurement.infrastructure.persistence.repository;

import com.health360.procurement.infrastructure.persistence.entity.GoodsReceiptLineEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GoodsReceiptLineRepository extends JpaRepository<GoodsReceiptLineEntity, UUID> {

    List<GoodsReceiptLineEntity> findByGoodsReceiptIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID goodsReceiptId);
}
