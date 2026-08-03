package com.health360.doctor.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "doctor", name = "memberships")
@Getter
@Setter
public class MembershipEntity extends BaseAuditableEntity {

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(nullable = false, length = 200)
    private String organization;

    @Column(name = "membership_id", length = 100)
    private String membershipId;

    @Column(name = "member_since")
    private Integer memberSince;
}
