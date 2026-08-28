package com.health360.org.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "org", name = "partner_org_memberships")
@Getter
@Setter
public class PartnerOrgMembershipEntity extends BaseAuditableEntity {

    @Column(name = "partner_org_id", nullable = false)
    private UUID partnerOrgId;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Column(name = "employment_status", nullable = false, length = 20)
    private String employmentStatus = "ACTIVE";

    @Column(name = "hired_at")
    private Instant hiredAt;
}
