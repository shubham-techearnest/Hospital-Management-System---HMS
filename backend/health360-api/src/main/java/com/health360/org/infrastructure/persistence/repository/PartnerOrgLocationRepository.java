package com.health360.org.infrastructure.persistence.repository;

import com.health360.org.infrastructure.persistence.entity.PartnerOrgLocationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PartnerOrgLocationRepository extends JpaRepository<PartnerOrgLocationEntity, UUID> {

    Optional<PartnerOrgLocationEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<PartnerOrgLocationEntity> findByTenantIdAndPartnerOrgIdAndDeletedAtIsNull(UUID tenantId, UUID partnerOrgId);

    List<PartnerOrgLocationEntity> findByTenantIdAndDeletedAtIsNull(UUID tenantId);
}
