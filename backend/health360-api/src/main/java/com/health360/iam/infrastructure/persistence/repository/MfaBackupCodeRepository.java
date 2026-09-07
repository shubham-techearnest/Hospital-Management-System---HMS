package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.MfaBackupCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MfaBackupCodeRepository extends JpaRepository<MfaBackupCodeEntity, UUID> {

    List<MfaBackupCodeEntity> findByUserIdAndUsedAtIsNullAndDeletedAtIsNull(UUID userId);
}
