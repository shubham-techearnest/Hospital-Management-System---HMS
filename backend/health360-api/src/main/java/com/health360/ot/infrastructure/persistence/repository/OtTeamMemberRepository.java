package com.health360.ot.infrastructure.persistence.repository;

import com.health360.ot.infrastructure.persistence.entity.OtTeamMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OtTeamMemberRepository extends JpaRepository<OtTeamMemberEntity, UUID> {

    List<OtTeamMemberEntity> findByProcedureIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID procedureId);

    long countByProcedureIdAndDeletedAtIsNull(UUID procedureId);
}
