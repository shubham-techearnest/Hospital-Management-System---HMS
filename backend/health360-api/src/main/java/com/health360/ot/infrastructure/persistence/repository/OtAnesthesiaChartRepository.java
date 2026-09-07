package com.health360.ot.infrastructure.persistence.repository;

import com.health360.ot.infrastructure.persistence.entity.OtAnesthesiaChartEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OtAnesthesiaChartRepository extends JpaRepository<OtAnesthesiaChartEntity, UUID> {

    Optional<OtAnesthesiaChartEntity> findByProcedureIdAndDeletedAtIsNull(UUID procedureId);
}
