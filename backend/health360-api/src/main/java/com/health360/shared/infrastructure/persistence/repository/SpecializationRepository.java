package com.health360.shared.infrastructure.persistence.repository;

import com.health360.shared.infrastructure.persistence.entity.SpecializationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpecializationRepository extends JpaRepository<SpecializationEntity, UUID> {

    List<SpecializationEntity> findByActiveTrueOrderByDisplayOrderAsc();

    boolean existsByIdAndActiveTrue(UUID id);
}
