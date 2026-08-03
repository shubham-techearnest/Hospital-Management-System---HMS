package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.QualificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QualificationRepository extends JpaRepository<QualificationEntity, UUID> {

    List<QualificationEntity> findByDoctorIdAndDeletedAtIsNullOrderByYearOfCompletionDesc(UUID doctorId);

    Optional<QualificationEntity> findByIdAndDoctorIdAndDeletedAtIsNull(UUID id, UUID doctorId);
}
