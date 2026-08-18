package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdRoundEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IpdRoundRepository extends JpaRepository<IpdRoundEntity, UUID> {

    List<IpdRoundEntity> findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByRecordedAtDesc(
            UUID tenantId, UUID admissionId);
}
