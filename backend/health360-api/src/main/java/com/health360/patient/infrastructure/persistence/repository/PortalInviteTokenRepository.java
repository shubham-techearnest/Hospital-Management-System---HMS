package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.PortalInviteTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PortalInviteTokenRepository extends JpaRepository<PortalInviteTokenEntity, UUID> {

    Optional<PortalInviteTokenEntity> findByTokenHashAndUsedAtIsNull(String tokenHash);
}
