package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.HealthDocumentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HealthDocumentRepository extends JpaRepository<HealthDocumentEntity, UUID> {

    Page<HealthDocumentEntity> findByPatientIdAndDeletedAtIsNullOrderByUploadedAtDesc(
            UUID patientId, Pageable pageable);

    Page<HealthDocumentEntity> findByPatientIdAndCategoryAndDeletedAtIsNullOrderByUploadedAtDesc(
            UUID patientId, String category, Pageable pageable);

    Optional<HealthDocumentEntity> findByIdAndPatientIdAndDeletedAtIsNull(UUID id, UUID patientId);

    long countByPatientIdAndDeletedAtIsNull(UUID patientId);
}
