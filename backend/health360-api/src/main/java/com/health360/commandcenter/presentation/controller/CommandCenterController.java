package com.health360.commandcenter.presentation.controller;

import com.health360.commandcenter.application.service.CommandCenterService;
import com.health360.commandcenter.presentation.dto.response.CommandCenterSnapshotResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/command-center")
@RequiredArgsConstructor
public class CommandCenterController {

    private final CommandCenterService commandCenterService;

    @GetMapping("/snapshot")
    @PreAuthorize("hasAuthority('commandcenter:read') or hasAuthority('tasks:read')")
    public ResponseEntity<ApiResponse<CommandCenterSnapshotResponse>> snapshot(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam UUID hospitalId,
            @RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(
                commandCenterService.snapshot(principal, hospitalId, branchId)));
    }
}
