package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdDischargeSummaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IpdDischargeSummaryRepository extends JpaRepository<IpdDischargeSummaryEntity, UUID> {

    Optional<IpdDischargeSummaryEntity> findByAdmissionIdAndDeletedAtIsNull(UUID admissionId);
}
