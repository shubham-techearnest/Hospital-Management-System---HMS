package com.health360.iam.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(schema = "iam", name = "role_permissions")
@IdClass(RolePermissionEntity.RolePermissionId.class)
@Getter
@Setter
public class RolePermissionEntity {

    @Id
    @Column(name = "role_id")
    private UUID roleId;

    @Id
    @Column(name = "permission_id")
    private UUID permissionId;

    public record RolePermissionId(UUID roleId, UUID permissionId) implements Serializable {
    }
}
