package com.health360.ipd.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "ipd", name = "rooms")
@Getter
@Setter
public class IpdRoomEntity extends BaseAuditableEntity {

    @Column(name = "ward_id", nullable = false)
    private UUID wardId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false)
    private boolean active = true;
}
