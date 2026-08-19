package com.health360.radiology.infrastructure.persistence.repository;

import com.health360.radiology.infrastructure.persistence.entity.ImagingStudyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ImagingStudyRepository extends JpaRepository<ImagingStudyEntity, UUID> {

    Optional<ImagingStudyEntity> findByImagingOrderIdAndDeletedAtIsNull(UUID imagingOrderId);
}
