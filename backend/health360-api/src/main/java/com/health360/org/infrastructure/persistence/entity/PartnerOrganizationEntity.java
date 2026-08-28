package com.health360.org.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(schema = "org", name = "partner_organizations")
@Getter
@Setter
public class PartnerOrganizationEntity extends BaseAuditableEntity {

    @Column(name = "org_type", nullable = false, length = 20)
    private String orgType;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "registration_number", length = 100)
    private String registrationNumber;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";
}
