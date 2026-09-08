package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdFinancialClearanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IpdFinancialClearanceRepository extends JpaRepository<IpdFinancialClearanceEntity, UUID> {

    Optional<IpdFinancialClearanceEntity> findByAdmissionIdAndDeletedAtIsNull(UUID admissionId);
}
