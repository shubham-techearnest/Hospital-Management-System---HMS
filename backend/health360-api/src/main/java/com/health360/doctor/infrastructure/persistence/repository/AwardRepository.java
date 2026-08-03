package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.AwardEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AwardRepository extends JpaRepository<AwardEntity, UUID> {

    List<AwardEntity> findByDoctorIdAndDeletedAtIsNullOrderByAwardYearDescTitleAsc(UUID doctorId);

    Optional<AwardEntity> findByIdAndDoctorIdAndDeletedAtIsNull(UUID id, UUID doctorId);
}
