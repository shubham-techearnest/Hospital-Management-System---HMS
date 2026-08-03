package com.health360.scheduling.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "scheduling", name = "doctor_schedules")
@Getter
@Setter
public class DoctorScheduleEntity extends BaseAuditableEntity {

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "slot_duration_minutes", nullable = false)
    private int slotDurationMinutes = 15;

    @Column(name = "buffer_minutes", nullable = false)
    private int bufferMinutes = 5;

    @Column(name = "horizon_days", nullable = false)
    private int horizonDays = 30;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
