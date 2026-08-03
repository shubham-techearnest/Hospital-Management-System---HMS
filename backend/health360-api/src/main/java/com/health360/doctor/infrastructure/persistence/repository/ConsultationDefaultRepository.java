package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.ConsultationDefaultEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConsultationDefaultRepository extends JpaRepository<ConsultationDefaultEntity, UUID> {

    List<ConsultationDefaultEntity> findByDoctorIdAndDeletedAtIsNull(UUID doctorId);

    Optional<ConsultationDefaultEntity> findByDoctorIdAndConsultationTypeAndDeletedAtIsNull(
            UUID doctorId, String consultationType);
}
