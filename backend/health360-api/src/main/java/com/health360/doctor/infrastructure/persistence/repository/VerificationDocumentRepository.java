package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.VerificationDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VerificationDocumentRepository extends JpaRepository<VerificationDocumentEntity, UUID> {
    List<VerificationDocumentEntity> findByDoctorIdAndDeletedAtIsNullOrderByUploadedAtDesc(UUID doctorId);
    Optional<VerificationDocumentEntity> findByIdAndDoctorIdAndDeletedAtIsNull(UUID id, UUID doctorId);
    boolean existsByDoctorIdAndDocumentTypeAndDeletedAtIsNull(UUID doctorId, String documentType);
}
