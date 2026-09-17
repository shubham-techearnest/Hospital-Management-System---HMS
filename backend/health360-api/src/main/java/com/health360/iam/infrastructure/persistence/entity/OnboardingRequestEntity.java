package com.health360.iam.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "iam", name = "onboarding_requests")
@Getter
@Setter
public class OnboardingRequestEntity extends BaseAuditableEntity {

    @Column(name = "request_type", nullable = false, length = 30)
    private String requestType;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "organization_name", length = 255)
    private String organizationName;

    @Column(name = "contact_name", nullable = false, length = 200)
    private String contactName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 120)
    private String city;

    @Column(length = 120)
    private String specialty;

    @Column(length = 2000)
    private String message;

    @Column(name = "admin_notes", length = 2000)
    private String adminNotes;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;
}
