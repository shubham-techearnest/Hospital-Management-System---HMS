package com.health360.pharmacy.infrastructure.persistence.repository;

import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PharmacyRequestItemRepository extends JpaRepository<PharmacyRequestItemEntity, UUID> {

    List<PharmacyRequestItemEntity> findByPharmacyRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID pharmacyRequestId);
}
