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
@Table(schema = "hospital", name = "staff")
@Getter
@Setter
public class StaffEntity extends BaseAuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Column(name = "employment_status", nullable = false, length = 20)
    private String employmentStatus = "ACTIVE";

    @Column(name = "hired_at", nullable = false)
    private Instant hiredAt = Instant.now();
}
