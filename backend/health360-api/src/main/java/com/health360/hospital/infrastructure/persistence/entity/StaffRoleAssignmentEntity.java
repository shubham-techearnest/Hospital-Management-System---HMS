package com.health360.hospital.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "hospital", name = "staff_role_assignments")
@Getter
@Setter
public class StaffRoleAssignmentEntity extends BaseAuditableEntity {

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    @Column(name = "role_name", nullable = false, length = 50)
    private String roleName;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt = Instant.now();

    @Column(name = "assigned_by")
    private UUID assignedBy;
}
