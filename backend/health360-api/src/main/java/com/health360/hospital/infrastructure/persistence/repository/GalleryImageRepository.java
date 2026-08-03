package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.GalleryImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GalleryImageRepository extends JpaRepository<GalleryImageEntity, UUID> {

    List<GalleryImageEntity> findByHospitalIdAndDeletedAtIsNullOrderByDisplayOrderAscCreatedAtAsc(UUID hospitalId);

    long countByHospitalIdAndDeletedAtIsNull(UUID hospitalId);

    Optional<GalleryImageEntity> findByIdAndHospitalIdAndDeletedAtIsNull(UUID id, UUID hospitalId);
}
