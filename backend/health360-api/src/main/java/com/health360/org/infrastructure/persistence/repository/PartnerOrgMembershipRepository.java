package com.health360.org.infrastructure.persistence.repository;

import com.health360.org.infrastructure.persistence.entity.PartnerOrgMembershipEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PartnerOrgMembershipRepository extends JpaRepository<PartnerOrgMembershipEntity, UUID> {

    Optional<PartnerOrgMembershipEntity> findByPartnerOrgIdAndUserIdAndDeletedAtIsNull(
            UUID partnerOrgId, UUID userId);

    List<PartnerOrgMembershipEntity> findByTenantIdAndUserIdAndEmploymentStatusAndDeletedAtIsNull(
            UUID tenantId, UUID userId, String employmentStatus);
}
