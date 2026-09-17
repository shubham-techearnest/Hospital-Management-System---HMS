package com.health360.tasks.presentation.controller;

import com.health360.config.security.UserPrincipal;
import com.health360.shared.dto.ApiResponse;
import com.health360.tasks.application.service.TaskService;
import com.health360.tasks.presentation.dto.request.UpdateWorkItemStatusRequest;
import com.health360.tasks.presentation.dto.response.MyWorkSummaryResponse;
import com.health360.tasks.presentation.dto.response.WorkItemResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/my-work")
    @PreAuthorize("hasAuthority('tasks:read')")
    public ResponseEntity<ApiResponse<Page<WorkItemResponse>>> myWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String queue,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                taskService.listMyWork(principal, hospitalId, status, queue, pageable)));
    }

    @GetMapping("/my-work/summary")
    @PreAuthorize("hasAuthority('tasks:read')")
    public ResponseEntity<ApiResponse<MyWorkSummaryResponse>> myWorkSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.myWorkSummary(principal, hospitalId)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('tasks:read')")
    public ResponseEntity<ApiResponse<Page<WorkItemResponse>>> listHospitalTasks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                taskService.listHospitalTasks(principal, hospitalId, pageable)));
    }

    @PatchMapping("/{taskId}/status")
    @PreAuthorize("hasAuthority('tasks:write')")
    public ResponseEntity<ApiResponse<WorkItemResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID taskId,
            @Valid @RequestBody UpdateWorkItemStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                taskService.updateStatus(principal, taskId, request)));
    }
}
