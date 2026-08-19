package com.health360.ot.infrastructure.persistence.repository;

import com.health360.ot.infrastructure.persistence.entity.OtNoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OtNoteRepository extends JpaRepository<OtNoteEntity, UUID> {

    List<OtNoteEntity> findByProcedureIdAndDeletedAtIsNullOrderByRecordedAtAsc(UUID procedureId);

    boolean existsByProcedureIdAndNoteTypeAndDeletedAtIsNull(UUID procedureId, String noteType);
}
