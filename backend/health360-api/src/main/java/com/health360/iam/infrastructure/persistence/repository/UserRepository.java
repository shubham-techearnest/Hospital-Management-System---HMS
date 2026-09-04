package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID>, JpaSpecificationExecutor<UserEntity> {

    Optional<UserEntity> findByTenantIdAndEmailIgnoreCase(UUID tenantId, String email);

    boolean existsByTenantIdAndEmailIgnoreCase(UUID tenantId, String email);

    @Query(value = """
            SELECT DISTINCT u.* FROM iam.users u
            INNER JOIN iam.user_roles ur ON ur.user_id = u.id
            INNER JOIN iam.roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
            WHERE u.tenant_id = :tenantId
              AND u.deleted_at IS NULL
              AND r.name = 'PATIENT'
              AND right(regexp_replace(coalesce(u.phone, ''), '[^0-9]', '', 'g'), 10) = :phoneLast10
            """, nativeQuery = true)
    List<UserEntity> findPatientUsersByPhoneLast10(
            @Param("tenantId") UUID tenantId,
            @Param("phoneLast10") String phoneLast10);

    @Query(value = """
            SELECT DISTINCT u.* FROM iam.users u
            INNER JOIN iam.user_roles ur ON ur.user_id = u.id
            INNER JOIN iam.roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
            WHERE u.tenant_id = :tenantId
              AND u.deleted_at IS NULL
              AND r.name = 'PATIENT'
              AND lower(trim(u.email)) = lower(trim(:email))
            LIMIT 1
            """, nativeQuery = true)
    Optional<UserEntity> findPatientUserByEmail(
            @Param("tenantId") UUID tenantId,
            @Param("email") String email);

    @Query(value = """
            SELECT DISTINCT u.* FROM iam.users u
            INNER JOIN iam.user_roles ur ON ur.user_id = u.id
            INNER JOIN iam.roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
            WHERE u.tenant_id = :tenantId
              AND u.deleted_at IS NULL
              AND r.name = 'PATIENT'
              AND lower(trim(u.first_name)) = lower(trim(:firstName))
              AND lower(trim(u.last_name)) = lower(trim(:lastName))
            """, nativeQuery = true)
    List<UserEntity> findPatientUsersByName(
            @Param("tenantId") UUID tenantId,
            @Param("firstName") String firstName,
            @Param("lastName") String lastName);

    long countByTenantIdAndDeletedAtIsNull(UUID tenantId);
}
