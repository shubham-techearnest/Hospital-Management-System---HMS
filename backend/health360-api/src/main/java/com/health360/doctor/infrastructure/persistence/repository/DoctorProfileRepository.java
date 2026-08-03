package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfileEntity, UUID> {

    Optional<DoctorProfileEntity> findByTenantIdAndUserIdAndDeletedAtIsNull(UUID tenantId, UUID userId);

    Optional<DoctorProfileEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Page<DoctorProfileEntity> findByTenantIdAndVerificationStatusAndDeletedAtIsNull(
            UUID tenantId, String verificationStatus, Pageable pageable);

    List<DoctorProfileEntity> findByTenantIdAndVerificationStatusAndDeletedAtIsNull(
            UUID tenantId, String verificationStatus);

    @Query("""
            SELECT d FROM DoctorProfileEntity d
            WHERE d.tenantId = :tenantId
              AND d.verificationStatus = 'VERIFIED'
              AND d.deletedAt IS NULL
              AND (
                LOWER(d.medicalRegistrationNumber) LIKE LOWER(CONCAT('%', :query, '%'))
                OR CAST(d.id AS string) LIKE CONCAT('%', :query, '%')
              )
            """)
    List<DoctorProfileEntity> searchVerifiedByRegistrationOrId(
            @Param("tenantId") UUID tenantId, @Param("query") String query, org.springframework.data.domain.Pageable pageable);

    boolean existsByTenantIdAndMedicalRegistrationNumberAndDeletedAtIsNullAndIdNot(
            UUID tenantId, String medicalRegistrationNumber, UUID excludeId);
}
