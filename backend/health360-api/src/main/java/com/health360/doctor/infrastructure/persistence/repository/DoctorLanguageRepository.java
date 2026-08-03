package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.DoctorLanguageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DoctorLanguageRepository extends JpaRepository<DoctorLanguageEntity, DoctorLanguageEntity.DoctorLanguageId> {
    List<DoctorLanguageEntity> findByDoctorIdOrderByLanguageCodeAsc(UUID doctorId);
    void deleteByDoctorIdAndLanguageCode(UUID doctorId, String languageCode);
    boolean existsByDoctorIdAndLanguageCode(UUID doctorId, String languageCode);
}
