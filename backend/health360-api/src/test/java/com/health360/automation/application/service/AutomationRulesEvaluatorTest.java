package com.health360.automation.application.service;

import com.health360.automation.domain.HospitalEventTypes;
import com.health360.automation.domain.TaskTypes;
import com.health360.automation.infrastructure.persistence.entity.HospitalEventEntity;
import com.health360.tasks.application.service.TaskService;
import com.health360.workflow.application.service.WorkflowRuntimeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AutomationRulesEvaluatorTest {

    @Mock
    private TaskService taskService;

    @Mock
    private WorkflowRuntimeService workflowRuntimeService;

    @InjectMocks
    private AutomationRulesEvaluator evaluator;

    @Test
    void admissionRequestedCreatesReviewTask() {
        HospitalEventEntity event = baseEvent(HospitalEventTypes.ADMISSION_REQUESTED);

        evaluator.evaluate(event);

        ArgumentCaptor<TaskService.CreateTaskCommand> captor =
                ArgumentCaptor.forClass(TaskService.CreateTaskCommand.class);
        verify(taskService).createTask(captor.capture());
        assertThat(captor.getValue().taskType()).isEqualTo(TaskTypes.REVIEW_ADMISSION_REQUEST);
        assertThat(captor.getValue().assignedRole()).isEqualTo("HOSPITAL_ADMIN");
        verify(workflowRuntimeService, never()).start(any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void patientDischargedStartsHousekeepingWorkflow() {
        HospitalEventEntity event = baseEvent(HospitalEventTypes.PATIENT_DISCHARGED);
        event.setPayload(Map.of("bedId", UUID.randomUUID().toString()));
        when(workflowRuntimeService.start(any(), any(), any(), eq(WorkflowRuntimeService.DISCHARGE_HOUSEKEEPING),
                any(), any(), any(), any())).thenReturn(null);

        evaluator.evaluate(event);

        verify(workflowRuntimeService).start(any(), any(), any(), eq(WorkflowRuntimeService.DISCHARGE_HOUSEKEEPING),
                any(), any(), any(), any());
        // fallback housekeeping task when workflow definition missing
        ArgumentCaptor<TaskService.CreateTaskCommand> captor =
                ArgumentCaptor.forClass(TaskService.CreateTaskCommand.class);
        verify(taskService).createTask(captor.capture());
        assertThat(captor.getValue().taskType()).isEqualTo(TaskTypes.HOUSEKEEPING_BED_CLEAN);
    }

    @Test
    void criticalResultCreatesUrgentDoctorTask() {
        HospitalEventEntity event = baseEvent(HospitalEventTypes.CRITICAL_RESULT);

        evaluator.evaluate(event);

        ArgumentCaptor<TaskService.CreateTaskCommand> captor =
                ArgumentCaptor.forClass(TaskService.CreateTaskCommand.class);
        verify(taskService).createTask(captor.capture());
        assertThat(captor.getValue().taskType()).isEqualTo(TaskTypes.REVIEW_CRITICAL_LAB);
        assertThat(captor.getValue().priority()).isEqualTo("URGENT");
        assertThat(captor.getValue().assignedRole()).isEqualTo("DOCTOR");
    }

    private static HospitalEventEntity baseEvent(String type) {
        HospitalEventEntity event = new HospitalEventEntity();
        event.setId(UUID.randomUUID());
        event.setTenantId(UUID.randomUUID());
        event.setHospitalId(UUID.randomUUID());
        event.setBranchId(UUID.randomUUID());
        event.setEventType(type);
        event.setPatientId(UUID.randomUUID());
        event.setEncounterId(UUID.randomUUID());
        event.setUserId(UUID.randomUUID());
        event.setEntityType("TestEntity");
        event.setEntityId(UUID.randomUUID());
        event.setPayload(Map.of());
        return event;
    }
}
