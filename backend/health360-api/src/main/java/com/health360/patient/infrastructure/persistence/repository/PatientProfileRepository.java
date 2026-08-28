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

    Optional<PatientProfileEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

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

    @Query(value = """
            SELECT p.* FROM patient.patient_profiles p
            LEFT JOIN iam.users u ON u.id = p.user_id AND u.deleted_at IS NULL
            WHERE p.tenant_id = :tenantId
              AND p.deleted_at IS NULL
              AND p.date_of_birth = :dateOfBirth
              AND (
                (
                  lower(trim(coalesce(p.legal_first_name, ''))) = lower(trim(:firstName))
                  AND lower(trim(coalesce(p.legal_last_name, ''))) = lower(trim(:lastName))
                )
                OR (
                  p.user_id IS NOT NULL
                  AND lower(trim(u.first_name)) = lower(trim(:firstName))
                  AND lower(trim(u.last_name)) = lower(trim(:lastName))
                )
              )
            """, nativeQuery = true, countQuery = """
            SELECT count(*) FROM patient.patient_profiles p
            LEFT JOIN iam.users u ON u.id = p.user_id AND u.deleted_at IS NULL
            WHERE p.tenant_id = :tenantId
              AND p.deleted_at IS NULL
              AND p.date_of_birth = :dateOfBirth
              AND (
                (
                  lower(trim(coalesce(p.legal_first_name, ''))) = lower(trim(:firstName))
                  AND lower(trim(coalesce(p.legal_last_name, ''))) = lower(trim(:lastName))
                )
                OR (
                  p.user_id IS NOT NULL
                  AND lower(trim(u.first_name)) = lower(trim(:firstName))
                  AND lower(trim(u.last_name)) = lower(trim(:lastName))
                )
              )
            """)
    Page<PatientProfileEntity> searchByNameAndDob(
            @Param("tenantId") UUID tenantId,
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("dateOfBirth") LocalDate dateOfBirth,
            Pageable pageable);

    @Query(value = """
            SELECT p.* FROM patient.patient_profiles p
            WHERE p.tenant_id = :tenantId
              AND p.deleted_at IS NULL
              AND (
                right(regexp_replace(coalesce(p.primary_phone, ''), '[^0-9]', '', 'g'), 10) = :phoneLast10
                OR right(regexp_replace(coalesce(p.secondary_phone, ''), '[^0-9]', '', 'g'), 10) = :phoneLast10
              )
            """, nativeQuery = true)
    List<PatientProfileEntity> findByTenantIdAndPhoneLast10(
            @Param("tenantId") UUID tenantId,
            @Param("phoneLast10") String phoneLast10);

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
