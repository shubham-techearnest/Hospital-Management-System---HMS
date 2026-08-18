package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalOrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClinicalOrderItemRepository extends JpaRepository<ClinicalOrderItemEntity, UUID> {

    List<ClinicalOrderItemEntity> findByOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID orderId);
}
