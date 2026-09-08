package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdDeathRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IpdDeathRecordRepository extends JpaRepository<IpdDeathRecordEntity, UUID> {
    Optional<IpdDeathRecordEntity> findByAdmissionIdAndDeletedAtIsNull(UUID admissionId);
}
