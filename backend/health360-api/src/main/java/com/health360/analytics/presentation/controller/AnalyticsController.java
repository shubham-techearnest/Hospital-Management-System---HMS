package com.health360.analytics.presentation.controller;

import com.health360.analytics.application.service.HealthDashboardService;
import com.health360.analytics.application.service.HealthReportPdfService;
import com.health360.analytics.application.service.MetricHistoryService;
import com.health360.analytics.domain.MetricType;
import com.health360.analytics.presentation.dto.response.DashboardResponse;
import com.health360.analytics.presentation.dto.response.MetricHistoryPointResponse;
import com.health360.analytics.presentation.dto.response.MetricResponse;
import com.health360.analytics.presentation.dto.response.SnapshotResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final HealthDashboardService healthDashboardService;
    private final MetricHistoryService metricHistoryService;
    private final HealthReportPdfService healthReportPdfService;

    @GetMapping("/patients/me/dashboard")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                healthDashboardService.getDashboard(principal.getUserId(), principal.getTenantId())));
    }

    @GetMapping("/patients/me/metrics")
    @PreAuthorize("hasAuthority('analytics:read')")
    public ResponseEntity<ApiResponse<List<MetricResponse>>> getAllMetrics(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                healthDashboardService.getAllMetrics(principal.getUserId(), principal.getTenantId())));
    }

    @GetMapping("/patients/me/metrics/{metricType}")
    @PreAuthorize("hasAuthority('analytics:read')")
    public ResponseEntity<ApiResponse<MetricResponse>> getMetric(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable MetricType metricType) {
        return ResponseEntity.ok(ApiResponse.ok(
                healthDashboardService.getMetric(principal.getUserId(), principal.getTenantId(), metricType)));
    }

    @GetMapping("/patients/me/metrics/{metricType}/history")
    @PreAuthorize("hasAuthority('analytics:read')")
    public ResponseEntity<ApiResponse<Page<MetricHistoryPointResponse>>> getMetricHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable MetricType metricType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant toDate,
            @PageableDefault(size = 20, sort = "recordedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                metricHistoryService.getHistory(
                        principal.getUserId(),
                        principal.getTenantId(),
                        metricType,
                        fromDate,
                        toDate,
                        pageable)));
    }

    @GetMapping("/patients/me/snapshots/latest")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ResponseEntity<ApiResponse<SnapshotResponse>> getLatestSnapshot(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                healthDashboardService.getLatestSnapshot(principal.getUserId(), principal.getTenantId())));
    }

    @GetMapping("/patients/me/report/pdf")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ResponseEntity<byte[]> downloadHealthReportPdf(
            @AuthenticationPrincipal UserPrincipal principal) {
        byte[] pdf = healthReportPdfService.generateReport(
                principal.getUserId(), principal.getTenantId());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"health-report.pdf\"")
                .body(pdf);
    }
}
