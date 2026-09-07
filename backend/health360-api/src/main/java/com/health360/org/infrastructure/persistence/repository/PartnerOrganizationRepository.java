package com.health360.org.infrastructure.persistence.repository;

import com.health360.org.infrastructure.persistence.entity.PartnerOrganizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PartnerOrganizationRepository extends JpaRepository<PartnerOrganizationEntity, UUID> {

    Optional<PartnerOrganizationEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    List<PartnerOrganizationEntity> findByTenantIdAndDeletedAtIsNullOrderByNameAsc(UUID tenantId);

    List<PartnerOrganizationEntity> findByTenantIdAndOrgTypeAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, String orgType);

    List<PartnerOrganizationEntity> findByTenantIdAndOrgTypeAndStatusAndDeletedAtIsNull(
            UUID tenantId, String orgType, String status);
}
