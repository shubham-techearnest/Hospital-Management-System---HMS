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
@Table(schema = "ipd", name = "transfer_out_records")
@Getter
@Setter
public class IpdTransferOutRecordEntity extends BaseAuditableEntity {

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "admission_id", nullable = false, unique = true)
    private UUID admissionId;

    @Column(name = "encounter_id", nullable = false)
    private UUID encounterId;

    @Column(name = "destination_name", nullable = false, length = 300)
    private String destinationName;

    @Column(name = "destination_hospital_id")
    private UUID destinationHospitalId;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "accepting_physician", length = 200)
    private String acceptingPhysician;

    @Column(name = "transferred_at", nullable = false)
    private Instant transferredAt = Instant.now();

    @Column(name = "transport_mode", length = 50)
    private String transportMode;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
