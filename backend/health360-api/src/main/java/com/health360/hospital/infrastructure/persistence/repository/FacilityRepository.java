package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.FacilityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FacilityRepository extends JpaRepository<FacilityEntity, UUID> {

    List<FacilityEntity> findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(UUID hospitalId);

    Optional<FacilityEntity> findByIdAndHospitalIdAndDeletedAtIsNull(UUID id, UUID hospitalId);
}
