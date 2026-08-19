package com.health360.icu.infrastructure.persistence.repository;

import com.health360.icu.infrastructure.persistence.entity.IcuEquipmentAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IcuEquipmentAssignmentRepository extends JpaRepository<IcuEquipmentAssignmentEntity, UUID> {

    boolean existsByEquipmentIdAndActiveTrueAndDeletedAtIsNull(UUID equipmentId);

    Optional<IcuEquipmentAssignmentEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<IcuEquipmentAssignmentEntity> findByTenantIdAndStayIdAndDeletedAtIsNullOrderByAssignedAtDesc(
            UUID tenantId, UUID stayId);
}
