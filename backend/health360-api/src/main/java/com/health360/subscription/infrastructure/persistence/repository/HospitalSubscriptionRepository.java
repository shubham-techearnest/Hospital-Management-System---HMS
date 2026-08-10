package com.health360.subscription.infrastructure.persistence.repository;

import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HospitalSubscriptionRepository extends JpaRepository<HospitalSubscriptionEntity, UUID> {

    Optional<HospitalSubscriptionEntity> findByHospitalIdAndStatusIn(UUID hospitalId, Iterable<String> statuses);

    Optional<HospitalSubscriptionEntity> findByHospitalIdAndTenantIdAndStatusIn(
            UUID hospitalId, UUID tenantId, Iterable<String> statuses);
}
