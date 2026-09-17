package com.health360.facility.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity(name = "FacilityWorkOrder")
@Table(schema = "facility", name = "work_orders")
@Getter
@Setter
public class FacilityWorkOrderEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "work_number", nullable = false, length = 40)
    private String workNumber;

    @Column(name = "work_type", nullable = false, length = 30)
    private String workType;

    @Column(nullable = false, length = 30)
    private String status = "OPEN";

    @Column(nullable = false, length = 20)
    private String priority = "NORMAL";

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "location_label", length = 200)
    private String locationLabel;

    @Column(name = "bed_id")
    private UUID bedId;

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "admission_id")
    private UUID admissionId;

    @Column(name = "requested_for_at")
    private Instant requestedForAt;

    @Column(name = "opened_at", nullable = false)
    private Instant openedAt = Instant.now();

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "completed_by")
    private UUID completedBy;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "source_event_type", length = 80)
    private String sourceEventType;

    @Column(name = "source_event_id")
    private UUID sourceEventId;
}
