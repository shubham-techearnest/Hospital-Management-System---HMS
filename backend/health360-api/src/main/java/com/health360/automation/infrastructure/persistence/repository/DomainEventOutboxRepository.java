package com.health360.automation.infrastructure.persistence.repository;

import com.health360.automation.infrastructure.persistence.entity.DomainEventOutboxEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DomainEventOutboxRepository extends JpaRepository<DomainEventOutboxEntity, UUID> {
}
