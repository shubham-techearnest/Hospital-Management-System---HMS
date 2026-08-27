package com.health360.clinical.application.service;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalFollowupEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalFollowupRepository;
import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.iam.domain.NotificationType;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

/**
 * ECO-P5: in-app follow-up due reminders (SMS gateway remains deferred).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FollowUpReminderScheduler {

    private final ClinicalFollowupRepository followupRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final TransactionalNotificationService notificationService;

    @Scheduled(fixedRate = 300_000)
    @Transactional
    public void dispatchDueFollowUpReminders() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        List<ClinicalFollowupEntity> due = followupRepository
                .findByStatusAndFollowUpDateAndReminderSentAtIsNullAndDeletedAtIsNull("PENDING", today);

        for (ClinicalFollowupEntity followup : due) {
            PatientProfileEntity patient = patientProfileRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(followup.getPatientId(), followup.getTenantId())
                    .orElse(null);
            if (patient == null || patient.getUserId() == null) {
                continue;
            }

            String reason = followup.getReason() != null && !followup.getReason().isBlank()
                    ? followup.getReason().trim()
                    : "your scheduled follow-up";
            notificationService.send(
                    followup.getTenantId(),
                    patient.getUserId(),
                    NotificationType.FOLLOW_UP_REMINDER,
                    "Follow-up due today",
                    "Reminder: " + reason + " is due today. Book or visit when ready.",
                    "ClinicalFollowup",
                    followup.getId());

            followup.setReminderSentAt(Instant.now());
            followupRepository.save(followup);
            log.debug("Sent follow-up reminder for {}", followup.getId());
        }
    }
}
