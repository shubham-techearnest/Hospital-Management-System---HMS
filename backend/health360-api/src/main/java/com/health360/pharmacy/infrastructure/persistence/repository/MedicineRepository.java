package com.health360.pharmacy.infrastructure.persistence.repository;

import com.health360.pharmacy.infrastructure.persistence.entity.MedicineEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicineRepository extends JpaRepository<MedicineEntity, UUID> {

    Optional<MedicineEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<MedicineEntity> findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID hospitalId, UUID branchId);
}
