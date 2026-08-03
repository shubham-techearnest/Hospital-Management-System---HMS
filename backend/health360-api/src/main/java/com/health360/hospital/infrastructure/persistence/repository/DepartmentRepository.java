package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<DepartmentEntity, UUID> {
    List<DepartmentEntity> findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(UUID hospitalId);
    Optional<DepartmentEntity> findByIdAndHospitalIdAndDeletedAtIsNull(UUID id, UUID hospitalId);
    boolean existsByHospitalIdAndNameIgnoreCaseAndDeletedAtIsNullAndIdNot(
            UUID hospitalId, String name, UUID excludeId);
}
