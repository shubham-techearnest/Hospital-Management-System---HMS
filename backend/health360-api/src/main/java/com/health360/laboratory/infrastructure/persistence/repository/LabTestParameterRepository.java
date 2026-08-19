package com.health360.laboratory.infrastructure.persistence.repository;

import com.health360.laboratory.infrastructure.persistence.entity.LabTestParameterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LabTestParameterRepository extends JpaRepository<LabTestParameterEntity, UUID> {

    List<LabTestParameterEntity> findByTenantIdAndLabTestIdAndDeletedAtIsNullOrderByNameAsc(
            UUID tenantId, UUID labTestId);

    Optional<LabTestParameterEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByLabTestIdAndCodeAndDeletedAtIsNull(UUID labTestId, String code);
}
