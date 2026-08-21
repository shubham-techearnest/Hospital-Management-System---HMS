package com.health360.clinical.infrastructure.persistence.repository;

import com.health360.clinical.infrastructure.persistence.entity.PrescriptionItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItemEntity, UUID> {

    List<PrescriptionItemEntity> findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(UUID prescriptionId);
}
