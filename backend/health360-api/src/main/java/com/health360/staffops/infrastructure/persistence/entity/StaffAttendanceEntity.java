package com.health360.staffops.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity(name = "StaffOpsAttendance")
@Table(schema = "staffops", name = "attendance")
@Getter
@Setter
public class StaffAttendanceEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    @Column(name = "roster_entry_id")
    private UUID rosterEntryId;

    @Column(name = "duty_date", nullable = false)
    private LocalDate dutyDate;

    @Column(nullable = false, length = 30)
    private String status = "PRESENT";

    @Column(name = "clock_in")
    private Instant clockIn;

    @Column(name = "clock_out")
    private Instant clockOut;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
