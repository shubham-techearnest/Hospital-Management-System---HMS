package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.DoctorSubSpecializationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DoctorSubSpecializationRepository
        extends JpaRepository<DoctorSubSpecializationEntity, DoctorSubSpecializationEntity.DoctorSubSpecializationId> {

    List<DoctorSubSpecializationEntity> findByDoctorId(UUID doctorId);

    void deleteByDoctorId(UUID doctorId);
}
