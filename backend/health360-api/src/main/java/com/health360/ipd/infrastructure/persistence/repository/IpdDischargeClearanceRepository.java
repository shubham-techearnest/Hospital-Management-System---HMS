package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdDischargeClearanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IpdDischargeClearanceRepository extends JpaRepository<IpdDischargeClearanceEntity, UUID> {
    List<IpdDischargeClearanceEntity> findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByClearanceTypeAsc(
            UUID tenantId, UUID admissionId);

    Optional<IpdDischargeClearanceEntity> findByAdmissionIdAndClearanceTypeAndDeletedAtIsNull(
            UUID admissionId, String clearanceType);
}
