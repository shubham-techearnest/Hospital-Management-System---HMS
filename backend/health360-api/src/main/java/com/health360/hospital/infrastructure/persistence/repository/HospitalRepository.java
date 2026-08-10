package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HospitalRepository extends JpaRepository<HospitalEntity, UUID> {
    Optional<HospitalEntity> findByTenantIdAndAdminUserIdAndDeletedAtIsNull(UUID tenantId, UUID adminUserId);
    Optional<HospitalEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);
    boolean existsByTenantIdAndRegistrationNumberAndDeletedAtIsNull(UUID tenantId, String registrationNumber);
    boolean existsByTenantIdAndRegistrationNumberAndDeletedAtIsNullAndIdNot(
            UUID tenantId, String registrationNumber, UUID excludeId);

    java.util.List<HospitalEntity> findByTenantIdAndDeletedAtIsNullOrderByNameAsc(UUID tenantId);

    Page<HospitalEntity> findByTenantIdAndDeletedAtIsNull(UUID tenantId, Pageable pageable);

    Page<HospitalEntity> findByTenantIdAndDeletedAtIsNullAndNameContainingIgnoreCase(
            UUID tenantId, String name, Pageable pageable);

    Page<HospitalEntity> findByTenantIdAndDeletedAtIsNullAndStatus(
            UUID tenantId, String status, Pageable pageable);

    Page<HospitalEntity> findByTenantIdAndDeletedAtIsNullAndNameContainingIgnoreCaseAndStatus(
            UUID tenantId, String name, String status, Pageable pageable);
}
