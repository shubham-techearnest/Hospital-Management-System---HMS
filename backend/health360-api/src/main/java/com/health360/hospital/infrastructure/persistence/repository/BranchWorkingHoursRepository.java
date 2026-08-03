package com.health360.hospital.infrastructure.persistence.repository;

import com.health360.hospital.infrastructure.persistence.entity.BranchWorkingHoursEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BranchWorkingHoursRepository extends JpaRepository<BranchWorkingHoursEntity, UUID> {
    List<BranchWorkingHoursEntity> findByBranchIdOrderByDayOfWeekAsc(UUID branchId);
    void deleteByBranchId(UUID branchId);
}
