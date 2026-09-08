package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdBloodRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IpdBloodRequestRepository extends JpaRepository<IpdBloodRequestEntity, UUID> {

    List<IpdBloodRequestEntity> findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByRequestedAtDesc(
            UUID tenantId, UUID admissionId);
}
