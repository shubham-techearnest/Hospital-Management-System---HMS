package com.health360.iam.infrastructure.persistence.repository;

import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByTenantIdAndEmailIgnoreCase(UUID tenantId, String email);

    boolean existsByTenantIdAndEmailIgnoreCase(UUID tenantId, String email);

    @Query("""
            SELECT u FROM UserEntity u
            WHERE u.tenantId = :tenantId
              AND u.deletedAt IS NULL
              AND (:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%')))
              AND (:name IS NULL OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%')))
              AND (:status IS NULL OR u.status = :status)
              AND (:role IS NULL OR u.id IN (
                  SELECT ur.userId FROM UserRoleEntity ur, RoleEntity r
                  WHERE ur.roleId = r.id AND r.name = :role AND r.deletedAt IS NULL
              ))
            """)
    Page<UserEntity> searchAdminUsers(
            @Param("tenantId") UUID tenantId,
            @Param("email") String email,
            @Param("name") String name,
            @Param("role") String role,
            @Param("status") String status,
            Pageable pageable);
}
