package com.health360.iam.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "iam", name = "impersonation_sessions")
@Getter
@Setter
public class ImpersonationSessionEntity {

    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_ENDED = "ENDED";
    public static final String STATUS_EXPIRED = "EXPIRED";

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "actor_user_id", nullable = false)
    private UUID actorUserId;

    @Column(name = "subject_user_id", nullable = false)
    private UUID subjectUserId;

    @Column(length = 500)
    private String reason;

    @Column(name = "environment_label", nullable = false, length = 32)
    private String environmentLabel;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "end_reason", length = 64)
    private String endReason;

    @Column(name = "actor_access_jti", length = 64)
    private String actorAccessJti;

    @Column(name = "subject_access_jti", length = 64)
    private String subjectAccessJti;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (startedAt == null) {
            startedAt = now;
        }
        if (status == null) {
            status = STATUS_ACTIVE;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
