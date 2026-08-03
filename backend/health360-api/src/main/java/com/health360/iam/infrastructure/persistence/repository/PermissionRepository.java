package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<PermissionEntity, UUID> {

    @Query(value = """
            SELECT DISTINCT p.code FROM iam.permissions p
            INNER JOIN iam.role_permissions rp ON rp.permission_id = p.id
            INNER JOIN iam.user_roles ur ON ur.role_id = rp.role_id
            WHERE ur.user_id = :userId
            """, nativeQuery = true)
    List<String> findPermissionCodesByUserId(@Param("userId") UUID userId);
}
