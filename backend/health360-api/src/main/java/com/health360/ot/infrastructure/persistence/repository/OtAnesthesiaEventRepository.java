package com.health360.ot.infrastructure.persistence.repository;

import com.health360.ot.infrastructure.persistence.entity.OtAnesthesiaEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OtAnesthesiaEventRepository extends JpaRepository<OtAnesthesiaEventEntity, UUID> {

    List<OtAnesthesiaEventEntity> findByProcedureIdAndDeletedAtIsNullOrderByRecordedAtAsc(UUID procedureId);
}
