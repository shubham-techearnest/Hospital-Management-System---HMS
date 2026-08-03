package com.health360.location.infrastructure.persistence.repository;

import com.health360.location.infrastructure.persistence.entity.GeocodeCacheEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GeocodeCacheRepository extends JpaRepository<GeocodeCacheEntity, UUID> {
    Optional<GeocodeCacheEntity> findFirstByNormalizedAddressIgnoreCaseOrderByCreatedAtDesc(String normalizedAddress);
}
