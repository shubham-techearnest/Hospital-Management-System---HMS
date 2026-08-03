package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BranchRepository extends JpaRepository<BranchEntity, UUID> {
    List<BranchEntity> findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(UUID hospitalId);
    Optional<BranchEntity> findByIdAndHospitalIdAndDeletedAtIsNull(UUID id, UUID hospitalId);
    long countByHospitalIdAndDeletedAtIsNull(UUID hospitalId);
}
