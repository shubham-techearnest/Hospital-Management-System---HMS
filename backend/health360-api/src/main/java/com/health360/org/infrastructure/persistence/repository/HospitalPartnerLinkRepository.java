package com.health360.org.infrastructure.persistence.repository;

import com.health360.org.infrastructure.persistence.entity.HospitalPartnerLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HospitalPartnerLinkRepository extends JpaRepository<HospitalPartnerLinkEntity, UUID> {

    List<HospitalPartnerLinkEntity> findByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNull(
            UUID tenantId, UUID hospitalId, String status);

    List<HospitalPartnerLinkEntity> findByTenantIdAndPartnerOrgIdAndDeletedAtIsNull(
            UUID tenantId, UUID partnerOrgId);

    boolean existsByHospitalIdAndPartnerOrgIdAndStatusAndDeletedAtIsNull(
            UUID hospitalId, UUID partnerOrgId, String status);
}
