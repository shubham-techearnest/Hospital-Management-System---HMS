package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdTransferOutRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IpdTransferOutRecordRepository extends JpaRepository<IpdTransferOutRecordEntity, UUID> {
    Optional<IpdTransferOutRecordEntity> findByAdmissionIdAndDeletedAtIsNull(UUID admissionId);
}
