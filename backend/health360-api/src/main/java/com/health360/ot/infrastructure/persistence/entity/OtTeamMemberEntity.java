package com.health360.ot.infrastructure.persistence.entity;

import com.health360.shared.infrastructure.persistence.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "ot", name = "ot_team_members")
@Getter
@Setter
public class OtTeamMemberEntity extends BaseAuditableEntity {

    @Column(name = "procedure_id", nullable = false)
    private UUID procedureId;

    @Column(name = "member_role", nullable = false, length = 30)
    private String memberRole;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "member_name", length = 200)
    private String memberName;
}
