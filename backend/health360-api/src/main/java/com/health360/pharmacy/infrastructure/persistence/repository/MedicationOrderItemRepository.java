package com.health360.pharmacy.infrastructure.persistence.repository;

import com.health360.pharmacy.infrastructure.persistence.entity.MedicationOrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicationOrderItemRepository extends JpaRepository<MedicationOrderItemEntity, UUID> {

    Optional<MedicationOrderItemEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<MedicationOrderItemEntity> findByMedicationOrderIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID medicationOrderId);

    long countByMedicationOrderIdAndDeletedAtIsNullAndStatusNot(UUID medicationOrderId, String status);
}
