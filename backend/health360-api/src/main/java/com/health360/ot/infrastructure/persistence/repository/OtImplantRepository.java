package com.health360.ot.infrastructure.persistence.repository;

import com.health360.ot.infrastructure.persistence.entity.OtImplantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OtImplantRepository extends JpaRepository<OtImplantEntity, UUID> {

    List<OtImplantEntity> findByProcedureIdAndDeletedAtIsNullOrderByImplantedAtAsc(UUID procedureId);
}
