package com.health360.scheduling.infrastructure.persistence.repository;

import com.health360.scheduling.infrastructure.persistence.entity.ScheduleBlockEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ScheduleBlockRepository extends JpaRepository<ScheduleBlockEntity, UUID> {

    List<ScheduleBlockEntity> findByScheduleIdAndDeletedAtIsNullOrderByDayOfWeekAscStartTimeAsc(UUID scheduleId);
}
