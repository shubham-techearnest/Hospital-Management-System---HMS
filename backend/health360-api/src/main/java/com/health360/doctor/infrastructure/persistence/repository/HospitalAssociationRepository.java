package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HospitalAssociationRepository extends JpaRepository<HospitalAssociationEntity, UUID> {
    List<HospitalAssociationEntity> findByDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID doctorId);
    List<HospitalAssociationEntity> findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID hospitalId);
    Optional<HospitalAssociationEntity> findByIdAndDoctorIdAndDeletedAtIsNull(UUID id, UUID doctorId);
    Optional<HospitalAssociationEntity> findByIdAndHospitalIdAndDeletedAtIsNull(UUID id, UUID hospitalId);
    boolean existsByDoctorIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
            UUID doctorId, UUID hospitalId, UUID branchId, String status);
}
