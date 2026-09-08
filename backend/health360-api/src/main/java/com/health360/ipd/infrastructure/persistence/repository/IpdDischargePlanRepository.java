package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdDischargePlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IpdDischargePlanRepository extends JpaRepository<IpdDischargePlanEntity, UUID> {
    Optional<IpdDischargePlanEntity> findByAdmissionIdAndDeletedAtIsNull(UUID admissionId);
}
