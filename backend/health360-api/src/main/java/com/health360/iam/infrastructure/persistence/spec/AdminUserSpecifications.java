package com.health360.iam.infrastructure.persistence.spec;

import com.health360.iam.infrastructure.persistence.entity.RoleEntity;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.entity.UserRoleEntity;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class AdminUserSpecifications {

    private AdminUserSpecifications() {
    }

    public static Specification<UserEntity> search(
            UUID tenantId,
            String emailPattern,
            String namePattern,
            String role,
            String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), tenantId));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (emailPattern != null) {
                predicates.add(cb.like(cb.lower(root.get("email")), emailPattern));
            }
            if (namePattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), namePattern),
                        cb.like(cb.lower(root.get("lastName")), namePattern)));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (role != null) {
                predicates.add(hasRole(root, query, cb, role));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Predicate hasRole(
            Root<UserEntity> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            String role) {
        Subquery<Long> subquery = query.subquery(Long.class);
        Root<UserRoleEntity> userRoleRoot = subquery.from(UserRoleEntity.class);
        Root<RoleEntity> roleRoot = subquery.from(RoleEntity.class);

        subquery.select(cb.literal(1L));
        subquery.where(
                cb.equal(userRoleRoot.get("userId"), root.get("id")),
                cb.equal(userRoleRoot.get("roleId"), roleRoot.get("id")),
                cb.equal(roleRoot.get("name"), role),
                cb.isNull(roleRoot.get("deletedAt")));

        return cb.exists(subquery);
    }
}
