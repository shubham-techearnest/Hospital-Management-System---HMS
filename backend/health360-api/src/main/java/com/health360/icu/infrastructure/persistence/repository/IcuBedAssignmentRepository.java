package com.health360.icu.infrastructure.persistence.repository;

import com.health360.icu.infrastructure.persistence.entity.IcuBedAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IcuBedAssignmentRepository extends JpaRepository<IcuBedAssignmentEntity, UUID> {

    boolean existsByBedIdAndActiveTrueAndDeletedAtIsNull(UUID bedId);

    Optional<IcuBedAssignmentEntity> findByStayIdAndActiveTrueAndDeletedAtIsNull(UUID stayId);
}
