package com.health360.subscription.infrastructure.persistence.repository;

import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HospitalSubscriptionHistoryRepository extends JpaRepository<HospitalSubscriptionHistoryEntity, UUID> {

    List<HospitalSubscriptionHistoryEntity> findByHospitalIdAndTenantIdOrderByEffectiveAtDesc(
            UUID hospitalId, UUID tenantId);
}
