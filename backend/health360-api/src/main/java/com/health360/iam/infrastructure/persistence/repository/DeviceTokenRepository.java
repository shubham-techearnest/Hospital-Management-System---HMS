package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.DeviceTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceTokenRepository extends JpaRepository<DeviceTokenEntity, UUID> {

    List<DeviceTokenEntity> findByUserIdAndDeletedAtIsNull(UUID userId);

    Optional<DeviceTokenEntity> findByExpoPushTokenAndDeletedAtIsNull(String expoPushToken);

    Optional<DeviceTokenEntity> findByExpoPushToken(String expoPushToken);
}
