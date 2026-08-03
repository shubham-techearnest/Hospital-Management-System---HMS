package com.health360.scheduling.infrastructure.persistence.repository;

import com.health360.scheduling.infrastructure.persistence.entity.AppointmentReminderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AppointmentReminderRepository extends JpaRepository<AppointmentReminderEntity, UUID> {

    boolean existsByAppointmentIdAndReminderType(UUID appointmentId, String reminderType);
}
