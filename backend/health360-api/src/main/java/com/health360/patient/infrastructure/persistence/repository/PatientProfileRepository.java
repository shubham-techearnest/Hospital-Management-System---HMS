package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientProfileRepository extends JpaRepository<PatientProfileEntity, UUID> {

    Optional<PatientProfileEntity> findByTenantIdAndUserIdAndDeletedAtIsNull(UUID tenantId, UUID userId);

    Optional<PatientProfileEntity> findByTenantIdAndUhidAndDeletedAtIsNull(UUID tenantId, String uhid);

    @Query("""
            SELECT p FROM PatientProfileEntity p
            WHERE p.tenantId = :tenantId
              AND p.deletedAt IS NULL
              AND p.primaryPhone = :phone
            """)
    List<PatientProfileEntity> findByTenantIdAndPrimaryPhone(
            @Param("tenantId") UUID tenantId,
            @Param("phone") String phone);

    @Query("""
            SELECT p FROM PatientProfileEntity p
            WHERE p.tenantId = :tenantId
              AND p.deletedAt IS NULL
              AND p.dateOfBirth = :dateOfBirth
              AND (
                lower(coalesce(p.legalFirstName, '')) LIKE lower(concat('%', :nameToken, '%'))
                OR lower(coalesce(p.legalLastName, '')) LIKE lower(concat('%', :nameToken, '%'))
              )
            """)
    Page<PatientProfileEntity> searchByNameAndDob(
            @Param("tenantId") UUID tenantId,
            @Param("nameToken") String nameToken,
            @Param("dateOfBirth") LocalDate dateOfBirth,
            Pageable pageable);

    @Query("""
            SELECT p FROM PatientProfileEntity p
            WHERE p.tenantId = :tenantId
              AND p.deletedAt IS NULL
              AND p.dateOfBirth = :dateOfBirth
              AND lower(trim(coalesce(p.legalFirstName, ''))) = lower(trim(:firstName))
              AND lower(trim(coalesce(p.legalLastName, ''))) = lower(trim(:lastName))
            """)
    List<PatientProfileEntity> findExactNameAndDob(
            @Param("tenantId") UUID tenantId,
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("dateOfBirth") LocalDate dateOfBirth);
}
