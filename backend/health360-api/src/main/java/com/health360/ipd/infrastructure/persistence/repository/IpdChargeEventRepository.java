package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdChargeEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IpdChargeEventRepository extends JpaRepository<IpdChargeEventEntity, UUID> {

    List<IpdChargeEventEntity> findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByServiceDateDescCreatedAtDesc(
            UUID tenantId, UUID admissionId);

    List<IpdChargeEventEntity> findByTenantIdAndAdmissionIdAndStatusAndDeletedAtIsNullOrderByServiceDateAsc(
            UUID tenantId, UUID admissionId, String status);

    Optional<IpdChargeEventEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByAdmissionIdAndChargeTypeAndServiceDateAndDeletedAtIsNullAndStatusNot(
            UUID admissionId, String chargeType, LocalDate serviceDate, String status);
}
