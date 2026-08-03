package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.UserRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRoleEntity, UUID> {

    @Query(value = """
            SELECT r.name FROM iam.roles r
            INNER JOIN iam.user_roles ur ON ur.role_id = r.id
            WHERE ur.user_id = :userId AND r.deleted_at IS NULL
            """, nativeQuery = true)
    List<String> findRoleNamesByUserId(@Param("userId") UUID userId);
}
