package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.StaffRoleAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StaffRoleAssignmentRepository extends JpaRepository<StaffRoleAssignmentEntity, UUID> {

    List<StaffRoleAssignmentEntity> findByStaffIdAndDeletedAtIsNull(UUID staffId);
}
