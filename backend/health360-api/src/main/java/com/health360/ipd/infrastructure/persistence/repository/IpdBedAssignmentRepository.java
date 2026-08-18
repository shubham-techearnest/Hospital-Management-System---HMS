package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdBedAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IpdBedAssignmentRepository extends JpaRepository<IpdBedAssignmentEntity, UUID> {

    Optional<IpdBedAssignmentEntity> findByAdmissionIdAndActiveTrueAndDeletedAtIsNull(UUID admissionId);

    boolean existsByBedIdAndActiveTrueAndDeletedAtIsNull(UUID bedId);
}
