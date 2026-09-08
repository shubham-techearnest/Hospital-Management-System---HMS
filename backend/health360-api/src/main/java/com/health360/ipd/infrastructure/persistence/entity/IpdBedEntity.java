package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "beds")
@Getter
@Setter
public class IpdBedEntity extends BaseAuditableEntity {

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "bed_number", nullable = false, length = 20)
    private String bedNumber;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE";

    @Column(name = "cleaning_started_at")
    private java.time.Instant cleaningStartedAt;

    @Column(name = "cleaned_at")
    private java.time.Instant cleanedAt;

    @Column(name = "cleaned_by")
    private UUID cleanedBy;
}
