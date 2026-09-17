package com.health360.tasks.application.service;

import com.health360.iam.application.service.TransactionalNotificationService;
import com.health360.iam.domain.NotificationType;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.tasks.infrastructure.persistence.entity.WorkItemEntity;
import com.health360.tasks.infrastructure.persistence.repository.WorkItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskEscalationScheduler {

    private final WorkItemRepository workItemRepository;
    private final UserRepository userRepository;
    private final TransactionalNotificationService notificationService;

    /** Every 5 minutes: bump overdue open tasks and notify assignees when possible. */
    @Scheduled(fixedRate = 300_000)
    @Transactional
    public void escalateOverdueTasks() {
        Instant now = Instant.now();
        Instant cooldown = now.minus(1, java.time.temporal.ChronoUnit.HOURS);
        List<WorkItemEntity> overdue = workItemRepository.findOverdueOpenTasks(now, cooldown);
        if (overdue.isEmpty()) {
            return;
        }

        for (WorkItemEntity item : overdue) {
            int nextLevel = item.getEscalationLevel() + 1;
            item.setEscalationLevel(nextLevel);
            item.setEscalationDeadline(now);
            if ("NORMAL".equals(item.getPriority()) || "LOW".equals(item.getPriority())) {
                item.setPriority("HIGH");
            } else if ("HIGH".equals(item.getPriority()) && nextLevel >= 2) {
                item.setPriority("URGENT");
            }
            item.touch();
            workItemRepository.save(item);

            if (item.getAssignedUserId() != null) {
                UserEntity user = userRepository.findById(item.getAssignedUserId()).orElse(null);
                if (user != null) {
                    notificationService.send(
                            item.getTenantId(),
                            user.getId(),
                            NotificationType.TASK_OVERDUE,
                            "Task overdue",
                            item.getTitle() + " is overdue (escalation level " + nextLevel + ").",
                            "WorkItem",
                            item.getId());
                }
            }
            log.info("Escalated work item {} to level {}", item.getId(), nextLevel);
        }
    }
}
