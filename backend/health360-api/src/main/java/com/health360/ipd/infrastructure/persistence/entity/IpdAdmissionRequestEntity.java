package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "admission_requests")
@Getter
@Setter
public class IpdAdmissionRequestEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "source_encounter_id")
    private UUID sourceEncounterId;

    @Column(name = "referring_doctor_id")
    private UUID referringDoctorId;

    @Column(name = "attending_doctor_id")
    private UUID attendingDoctorId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "request_number", nullable = false, length = 50)
    private String requestNumber;

    @Column(name = "admission_source", nullable = false, length = 40)
    private String admissionSource;

    @Column(name = "admission_type", nullable = false, length = 40)
    private String admissionType;

    @Column(nullable = false, length = 30)
    private String status = "REQUESTED";

    @Column(nullable = false, length = 20)
    private String priority = "ROUTINE";

    @Column(name = "reason_for_admission", columnDefinition = "TEXT")
    private String reasonForAdmission;

    @Column(name = "provisional_diagnosis", columnDefinition = "TEXT")
    private String provisionalDiagnosis;

    @Column(name = "requested_care_level", length = 40)
    private String requestedCareLevel;

    @Column(name = "requested_room_category", length = 40)
    private String requestedRoomCategory;

    @Column(name = "expected_los_days")
    private Integer expectedLosDays;

    @Column(name = "planned_procedure", columnDefinition = "TEXT")
    private String plannedProcedure;

    @Column(name = "isolation_required", nullable = false)
    private boolean isolationRequired;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "requested_admit_at")
    private Instant requestedAdmitAt;

    @Column(name = "scheduled_admit_at")
    private Instant scheduledAdmitAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "resulting_admission_id")
    private UUID resultingAdmissionId;

    @Column(name = "reserved_bed_id")
    private UUID reservedBedId;
}
