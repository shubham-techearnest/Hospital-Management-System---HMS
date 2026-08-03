package com.health360.iam.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(schema = "iam", name = "roles")
@Getter
@Setter
public class RoleEntity extends BaseAuditableEntity {

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;
}
