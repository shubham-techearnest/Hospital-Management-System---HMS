package com.health360.scheduling.application.service;

import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.iam.domain.NotificationType;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentReminderEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentReminderRepository;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private static final List<String> ACTIVE_STATUSES = List.of("PENDING", "CONFIRMED");

    private final AppointmentRepository appointmentRepository;
    private final AppointmentReminderRepository reminderRepository;
    private final TransactionalNotificationService notificationService;
    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void dispatchReminders() {
        Instant now = Instant.now();
        dispatchWindow(now, 24, NotificationType.APPOINTMENT_REMINDER_24H, "24H");
        dispatchWindow(now, 1, NotificationType.APPOINTMENT_REMINDER_1H, "1H");
    }

    private void dispatchWindow(Instant now, int hoursAhead, NotificationType type, String reminderType) {
        Instant windowStart = now.plus(hoursAhead, ChronoUnit.HOURS).minus(1, ChronoUnit.MINUTES);
        Instant windowEnd = now.plus(hoursAhead, ChronoUnit.HOURS).plus(1, ChronoUnit.MINUTES);

        List<AppointmentEntity> appointments = appointmentRepository
                .findByStatusInAndScheduledAtBetweenAndDeletedAtIsNull(ACTIVE_STATUSES, windowStart, windowEnd);

        for (AppointmentEntity appointment : appointments) {
            if (reminderRepository.existsByAppointmentIdAndReminderType(appointment.getId(), reminderType)) {
                continue;
            }
            sendReminder(appointment, type, reminderType, hoursAhead);
        }
    }

    private void sendReminder(
            AppointmentEntity appointment,
            NotificationType type,
            String reminderType,
            int hoursAhead) {
        String context = buildContext(appointment);
        String title = "Appointment reminder";
        String message = String.format(
                "Reminder: your appointment %s is in %d hour(s). %s",
                appointment.getScheduledAt(), hoursAhead, context);

        UUID patientUserId = patientProfileRepository.findById(appointment.getPatientId())
                .map(PatientProfileEntity::getUserId)
                .orElse(null);
        UUID doctorUserId = doctorProfileRepository.findById(appointment.getDoctorId())
                .map(DoctorProfileEntity::getUserId)
                .orElse(null);

        if (patientUserId != null) {
            notificationService.send(
                    appointment.getTenantId(), patientUserId, type, title, message, "Appointment", appointment.getId());
        }
        if (doctorUserId != null) {
            notificationService.send(
                    appointment.getTenantId(), doctorUserId, type, title, message, "Appointment", appointment.getId());
        }

        AppointmentReminderEntity reminder = new AppointmentReminderEntity();
        reminder.setTenantId(appointment.getTenantId());
        reminder.setAppointmentId(appointment.getId());
        reminder.setReminderType(reminderType);
        reminderRepository.save(reminder);

        log.debug("Sent {} reminder for appointment {}", reminderType, appointment.getId());
    }

    private String buildContext(AppointmentEntity appointment) {
        HospitalEntity hospital = hospitalRepository.findById(appointment.getHospitalId()).orElse(null);
        BranchEntity branch = branchRepository.findById(appointment.getBranchId()).orElse(null);
        DoctorProfileEntity doctor = doctorProfileRepository.findById(appointment.getDoctorId()).orElse(null);
        String doctorName = "your doctor";
        if (doctor != null) {
            doctorName = userRepository.findById(doctor.getUserId())
                    .map(this::fullName)
                    .orElse(doctorName);
        }
        String location = hospital != null ? hospital.getName() : "clinic";
        if (branch != null) {
            location += " — " + branch.getName();
        }
        return "With Dr. " + doctorName + " at " + location + ".";
    }

    private String fullName(UserEntity user) {
        return user.getFirstName() + " " + user.getLastName();
    }
}
