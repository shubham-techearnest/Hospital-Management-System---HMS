package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.ExperienceEntryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExperienceEntryRepository extends JpaRepository<ExperienceEntryEntity, UUID> {

    List<ExperienceEntryEntity> findByDoctorIdAndDeletedAtIsNullOrderByStartYearDesc(UUID doctorId);

    Optional<ExperienceEntryEntity> findByIdAndDoctorIdAndDeletedAtIsNull(UUID id, UUID doctorId);
}
