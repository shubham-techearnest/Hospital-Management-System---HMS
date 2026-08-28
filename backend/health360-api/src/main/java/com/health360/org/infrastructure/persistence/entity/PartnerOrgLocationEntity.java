package com.health360.org.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "org", name = "partner_org_locations")
@Getter
@Setter
public class PartnerOrgLocationEntity extends BaseAuditableEntity {

    @Column(name = "partner_org_id", nullable = false)
    private UUID partnerOrgId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "address_line1", nullable = false)
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 20)
    private String pincode;

    @Column(nullable = false, length = 100)
    private String country = "India";

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 30)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(name = "is_primary", nullable = false)
    private boolean primaryLocation;
}
