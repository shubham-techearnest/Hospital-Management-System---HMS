package com.health360.org.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "org", name = "hospital_partner_links")
@Getter
@Setter
public class HospitalPartnerLinkEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "partner_org_id", nullable = false)
    private UUID partnerOrgId;

    @Column(name = "link_type", nullable = false, length = 30)
    private String linkType = "IN_NETWORK";

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";
}
