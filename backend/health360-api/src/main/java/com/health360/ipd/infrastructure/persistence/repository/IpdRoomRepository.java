package com.health360.ipd.infrastructure.persistence.repository;

import com.health360.ipd.infrastructure.persistence.entity.IpdRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IpdRoomRepository extends JpaRepository<IpdRoomEntity, UUID> {

    List<IpdRoomEntity> findByTenantIdAndWardIdAndDeletedAtIsNullOrderByCodeAsc(UUID tenantId, UUID wardId);

    Optional<IpdRoomEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    boolean existsByWardIdAndCodeAndDeletedAtIsNull(UUID wardId, String code);
}
