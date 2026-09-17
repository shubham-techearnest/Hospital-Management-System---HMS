package com.health360.staffops.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity(name = "StaffOpsRosterEntry")
@Table(schema = "staffops", name = "roster_entries")
@Getter
@Setter
public class StaffRosterEntryEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    @Column(name = "shift_id", nullable = false)
    private UUID shiftId;

    @Column(name = "duty_date", nullable = false)
    private LocalDate dutyDate;

    @Column(nullable = false, length = 30)
    private String status = "PLANNED";

    @Column(columnDefinition = "TEXT")
    private String notes;
}
