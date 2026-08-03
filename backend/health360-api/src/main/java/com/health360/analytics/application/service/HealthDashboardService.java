package com.health360.analytics.application.service;

import com.health360.analytics.domain.CalculatedMetric;
import com.health360.analytics.domain.ClassificationLevel;
import com.health360.analytics.domain.MetricType;
import com.health360.analytics.domain.PatientProfileContext;
import com.health360.analytics.infrastructure.persistence.entity.CalculatedMetricEntity;
import com.health360.analytics.infrastructure.persistence.entity.HealthMetricsSnapshotEntity;
import com.health360.analytics.infrastructure.persistence.repository.CalculatedMetricRepository;
import com.health360.analytics.infrastructure.persistence.repository.HealthMetricsSnapshotRepository;
import com.health360.analytics.presentation.dto.response.DashboardResponse;
import com.health360.analytics.presentation.dto.response.GoalProgressResponse;
import com.health360.analytics.presentation.dto.response.MetricResponse;
import com.health360.analytics.presentation.dto.response.SnapshotResponse;
import com.health360.analytics.presentation.dto.response.TimelineEventResponse;
import com.health360.analytics.presentation.dto.response.VitalsTrendSeriesResponse;
import com.health360.patient.infrastructure.persistence.entity.PhysicalMeasurementHistoryEntity;
import com.health360.patient.infrastructure.persistence.entity.VitalSignRecordEntity;
import com.health360.patient.infrastructure.persistence.repository.PhysicalMeasurementHistoryRepository;
import com.health360.patient.infrastructure.persistence.repository.VitalSignRecordRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class HealthDashboardService {

    private final FormulaEngineService formulaEngineService;
    private final PatientProfileContextAssembler contextAssembler;
    private final HealthMetricsSnapshotRepository snapshotRepository;
    private final CalculatedMetricRepository calculatedMetricRepository;
    private final VitalSignRecordRepository vitalSignRecordRepository;
    private final PhysicalMeasurementHistoryRepository measurementHistoryRepository;

    @Transactional
    public SnapshotResponse calculateAndPersist(UUID userId, UUID tenantId) {
        PatientProfileContext ctx = contextAssembler.assemble(userId, tenantId);
        List<CalculatedMetric> metrics = formulaEngineService.calculateAll(ctx);
        return persistSnapshot(ctx, metrics);
    }

    @Transactional
    public DashboardResponse getDashboard(UUID userId, UUID tenantId) {
        SnapshotResponse snapshot = calculateAndPersist(userId, tenantId);
        PatientProfileContext ctx = contextAssembler.assemble(userId, tenantId);
        return toDashboard(snapshot, ctx);
    }

    @Transactional
    public List<MetricResponse> getAllMetrics(UUID userId, UUID tenantId) {
        return getDashboard(userId, tenantId).getMetrics();
    }

    @Transactional
    public MetricResponse getMetric(UUID userId, UUID tenantId, MetricType metricType) {
        UUID patientId = contextAssembler.assemble(userId, tenantId).patientId();
        HealthMetricsSnapshotEntity snapshot = snapshotRepository
                .findFirstByPatientIdAndTenantIdOrderByCalculatedAtDesc(patientId, tenantId)
                .orElse(null);

        if (snapshot == null) {
            SnapshotResponse created = calculateAndPersist(userId, tenantId);
            return created.getMetrics().stream()
                    .filter(m -> m.getMetricType() == metricType)
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Metric not found: " + metricType));
        }

        return calculatedMetricRepository.findBySnapshotIdAndMetricType(snapshot.getId(), metricType.name())
                .map(this::toMetricResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Metric not found: " + metricType));
    }

    @Transactional
    public SnapshotResponse getLatestSnapshot(UUID userId, UUID tenantId) {
        UUID patientId = contextAssembler.assemble(userId, tenantId).patientId();
        return snapshotRepository.findFirstByPatientIdAndTenantIdOrderByCalculatedAtDesc(patientId, tenantId)
                .map(snapshot -> toSnapshot(snapshot,
                        calculatedMetricRepository.findBySnapshotIdOrderByMetricType(snapshot.getId())))
                .orElseGet(() -> calculateAndPersist(userId, tenantId));
    }

    private SnapshotResponse persistSnapshot(PatientProfileContext ctx, List<CalculatedMetric> metrics) {
        CalculatedMetric completion = findMetric(metrics, MetricType.PROFILE_COMPLETION);
        CalculatedMetric wellness = findMetric(metrics, MetricType.WELLNESS_SCORE);
        CalculatedMetric risk = findMetric(metrics, MetricType.HEALTH_RISK_SCORE);

        HealthMetricsSnapshotEntity snapshot = new HealthMetricsSnapshotEntity();
        snapshot.setTenantId(ctx.tenantId());
        snapshot.setPatientId(ctx.patientId());
        snapshot.setCalculatedAt(Instant.now());
        snapshot.setProfileCompletionAtCalc(completion.value() != null ? completion.value().intValue() : 0);
        if (wellness.value() != null) {
            int score = wellness.value().intValue();
            snapshot.setWellnessScore(score);
            snapshot.setWellnessLabel(wellnessLabel(score));
        }
        if (risk.value() != null) {
            int score = risk.value().intValue();
            snapshot.setHealthRiskScore(score);
            snapshot.setHealthRiskLabel(riskLabel(score));
        }
        snapshot.setWellnessFactors(buildWellnessFactors(metrics));
        snapshot.setRiskFactors(buildRiskFactors(ctx, metrics));

        snapshot = snapshotRepository.saveAndFlush(snapshot);

        UUID snapshotId = snapshot.getId();
        for (CalculatedMetric metric : metrics) {
            CalculatedMetricEntity entity = new CalculatedMetricEntity();
            entity.setSnapshotId(snapshotId);
            entity.setMetricType(metric.metricType().name());
            entity.setValue(metric.value());
            entity.setUnit(metric.unit());
            entity.setClassification(metric.classification().name());
            entity.setInterpretation(metric.interpretation());
            entity.setMissingFields(metric.missingFields());
            entity.setDisplayValue(metric.displayValue());
            calculatedMetricRepository.save(entity);
        }

        List<CalculatedMetricEntity> saved =
                calculatedMetricRepository.findBySnapshotIdOrderByMetricType(snapshotId);
        return toSnapshot(snapshot, saved);
    }

    private CalculatedMetric findMetric(List<CalculatedMetric> metrics, MetricType type) {
        return metrics.stream()
                .filter(m -> m.metricType() == type)
                .findFirst()
                .orElseThrow();
    }

    private String wellnessLabel(int score) {
        if (score >= 80) {
            return "EXCELLENT";
        }
        if (score >= 60) {
            return "GOOD";
        }
        if (score >= 40) {
            return "FAIR";
        }
        return "NEEDS_ATTENTION";
    }

    private String riskLabel(int score) {
        if (score <= 25) {
            return "LOW_RISK";
        }
        if (score <= 50) {
            return "MODERATE_RISK";
        }
        if (score <= 75) {
            return "HIGH_RISK";
        }
        return "VERY_HIGH_RISK";
    }

    private Map<String, Object> buildWellnessFactors(List<CalculatedMetric> metrics) {
        Map<String, Object> factors = new HashMap<>();
        metricOptional(metrics, MetricType.BMI).ifPresent(m -> factors.put("bmi", metricSummary(m)));
        metricOptional(metrics, MetricType.BP_CLASSIFICATION).ifPresent(m -> factors.put("bp", metricSummary(m)));
        metricOptional(metrics, MetricType.PROFILE_COMPLETION).ifPresent(m -> factors.put("completion", metricSummary(m)));
        return factors;
    }

    private Map<String, Object> buildRiskFactors(PatientProfileContext ctx, List<CalculatedMetric> metrics) {
        Map<String, Object> factors = new HashMap<>();
        factors.put("chronicConditions", ctx.conditionCount());
        factors.put("severeAllergies", ctx.severeAllergyCount());
        factors.put("familyHistory", ctx.familyWithHereditaryCount());
        metricOptional(metrics, MetricType.BP_CLASSIFICATION).ifPresent(m -> factors.put("bp", metricSummary(m)));
        metricOptional(metrics, MetricType.BLOOD_SUGAR_CLASSIFICATION).ifPresent(m -> factors.put("glucose", metricSummary(m)));
        return factors;
    }

    private java.util.Optional<CalculatedMetric> metricOptional(List<CalculatedMetric> metrics, MetricType type) {
        return metrics.stream().filter(m -> m.metricType() == type).findFirst();
    }

    private Map<String, Object> metricSummary(CalculatedMetric metric) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("classification", metric.classification().name());
        if (metric.value() != null) {
            summary.put("value", metric.value());
        }
        if (metric.displayValue() != null) {
            summary.put("displayValue", metric.displayValue());
        }
        return summary;
    }

    private DashboardResponse toDashboard(SnapshotResponse snapshot, PatientProfileContext ctx) {
        List<MetricResponse> metrics = snapshot.getMetrics() != null ? snapshot.getMetrics() : List.of();
        return DashboardResponse.builder()
                .completionScore(snapshot.getProfileCompletionAtCalc())
                .wellnessScore(snapshot.getWellnessScore())
                .healthRiskScore(snapshot.getHealthRiskScore())
                .metrics(metrics)
                .goalsProgress(buildGoalsProgress(ctx, metrics))
                .recentVitalsTrend(buildVitalsTrend(ctx.patientId()))
                .recentTimeline(buildRecentTimeline(ctx.patientId()))
                .disclaimer(snapshot.getDisclaimer())
                .calculatedAt(snapshot.getCalculatedAt())
                .build();
    }

    private DashboardResponse toDashboard(HealthMetricsSnapshotEntity snapshot,
                                            List<CalculatedMetricEntity> metrics,
                                            PatientProfileContext ctx) {
        List<MetricResponse> metricResponses = metrics.stream().map(this::toMetricResponse).toList();
        return DashboardResponse.builder()
                .completionScore(snapshot.getProfileCompletionAtCalc())
                .wellnessScore(DashboardResponse.ScoreSummary.builder()
                        .score(snapshot.getWellnessScore())
                        .label(snapshot.getWellnessLabel())
                        .build())
                .healthRiskScore(DashboardResponse.ScoreSummary.builder()
                        .score(snapshot.getHealthRiskScore())
                        .label(snapshot.getHealthRiskLabel())
                        .build())
                .metrics(metricResponses)
                .goalsProgress(buildGoalsProgress(ctx, metricResponses))
                .recentVitalsTrend(buildVitalsTrend(ctx.patientId()))
                .recentTimeline(buildRecentTimeline(ctx.patientId()))
                .disclaimer(FormulaEngineService.DISCLAIMER)
                .calculatedAt(snapshot.getCalculatedAt())
                .build();
    }

    private SnapshotResponse toSnapshot(HealthMetricsSnapshotEntity snapshot,
                                          List<CalculatedMetricEntity> metrics) {
        return SnapshotResponse.builder()
                .id(snapshot.getId())
                .calculatedAt(snapshot.getCalculatedAt())
                .profileCompletionAtCalc(snapshot.getProfileCompletionAtCalc())
                .wellnessScore(DashboardResponse.ScoreSummary.builder()
                        .score(snapshot.getWellnessScore())
                        .label(snapshot.getWellnessLabel())
                        .build())
                .healthRiskScore(DashboardResponse.ScoreSummary.builder()
                        .score(snapshot.getHealthRiskScore())
                        .label(snapshot.getHealthRiskLabel())
                        .build())
                .wellnessFactors(snapshot.getWellnessFactors())
                .riskFactors(snapshot.getRiskFactors())
                .metrics(metrics.stream().map(this::toMetricResponse).toList())
                .disclaimer(FormulaEngineService.DISCLAIMER)
                .build();
    }

    private MetricResponse toMetricResponse(CalculatedMetricEntity entity) {
        ClassificationLevel classification = ClassificationLevel.INSUFFICIENT_DATA;
        if (entity.getClassification() != null) {
            try {
                classification = ClassificationLevel.valueOf(entity.getClassification());
            } catch (IllegalArgumentException ignored) {
                classification = ClassificationLevel.INSUFFICIENT_DATA;
            }
        }

        List<String> missingFields = entity.getMissingFields() != null
                ? entity.getMissingFields()
                : Collections.emptyList();

        return MetricResponse.builder()
                .metricType(MetricType.valueOf(entity.getMetricType()))
                .value(entity.getValue())
                .unit(entity.getUnit())
                .classification(classification)
                .interpretation(entity.getInterpretation())
                .missingFields(missingFields)
                .displayValue(entity.getDisplayValue())
                .disclaimer(FormulaEngineService.DISCLAIMER)
                .build();
    }

    private List<GoalProgressResponse> buildGoalsProgress(PatientProfileContext ctx, List<MetricResponse> metrics) {
        List<GoalProgressResponse> goals = new ArrayList<>();

        if (ctx.targetWeightKg() != null && ctx.weightKg() != null) {
            goals.add(GoalProgressResponse.builder()
                    .goalType("WEIGHT")
                    .label("Target Weight")
                    .currentValue(ctx.weightKg())
                    .targetValue(ctx.targetWeightKg())
                    .unit("kg")
                    .progressPercent(weightProgress(ctx.weightKg(), ctx.targetWeightKg()))
                    .build());
        }

        BigDecimal waterRecommendation = metricValue(metrics, MetricType.WATER_INTAKE);
        if (ctx.waterIntakeMlGoal() != null && waterRecommendation != null) {
            goals.add(GoalProgressResponse.builder()
                    .goalType("WATER")
                    .label("Daily Water")
                    .currentValue(waterRecommendation)
                    .targetValue(BigDecimal.valueOf(ctx.waterIntakeMlGoal()))
                    .unit("ml")
                    .progressPercent(ratioProgress(waterRecommendation, BigDecimal.valueOf(ctx.waterIntakeMlGoal())))
                    .build());
        }

        if (ctx.sleepHoursGoal() != null && ctx.averageSleepHours() != null) {
            goals.add(GoalProgressResponse.builder()
                    .goalType("SLEEP")
                    .label("Sleep Hours")
                    .currentValue(ctx.averageSleepHours())
                    .targetValue(ctx.sleepHoursGoal())
                    .unit("hrs")
                    .progressPercent(ratioProgress(ctx.averageSleepHours(), ctx.sleepHoursGoal()))
                    .build());
        }

        BigDecimal stepGoal = metricValue(metrics, MetricType.DAILY_STEP_GOAL);
        if (ctx.dailyStepsGoal() != null && stepGoal != null) {
            goals.add(GoalProgressResponse.builder()
                    .goalType("STEPS")
                    .label("Daily Steps")
                    .currentValue(stepGoal)
                    .targetValue(BigDecimal.valueOf(ctx.dailyStepsGoal()))
                    .unit("steps")
                    .progressPercent(ratioProgress(stepGoal, BigDecimal.valueOf(ctx.dailyStepsGoal())))
                    .build());
        }

        return goals;
    }

    private List<VitalsTrendSeriesResponse> buildVitalsTrend(UUID patientId) {
        var vitalsPage = vitalSignRecordRepository.findByPatientIdOrderByRecordedAtDesc(
                patientId, PageRequest.of(0, 7));
        List<VitalSignRecordEntity> vitals = vitalsPage.getContent();

        List<VitalsTrendSeriesResponse.TrendPoint> systolic = new ArrayList<>();
        List<VitalsTrendSeriesResponse.TrendPoint> glucose = new ArrayList<>();
        List<VitalsTrendSeriesResponse.TrendPoint> weight = new ArrayList<>();

        for (VitalSignRecordEntity vital : vitals) {
            if (vital.getSystolicBp() != null) {
                systolic.add(VitalsTrendSeriesResponse.TrendPoint.builder()
                        .recordedAt(vital.getRecordedAt())
                        .value(BigDecimal.valueOf(vital.getSystolicBp()))
                        .build());
            }
            if (vital.getBloodGlucose() != null) {
                glucose.add(VitalsTrendSeriesResponse.TrendPoint.builder()
                        .recordedAt(vital.getRecordedAt())
                        .value(vital.getBloodGlucose())
                        .build());
            }
        }

        var measurementsPage = measurementHistoryRepository.findByPatientIdOrderByMeasuredAtDesc(
                patientId, PageRequest.of(0, 7));
        for (PhysicalMeasurementHistoryEntity measurement : measurementsPage.getContent()) {
            if (measurement.getWeightKg() != null) {
                weight.add(VitalsTrendSeriesResponse.TrendPoint.builder()
                        .recordedAt(measurement.getMeasuredAt())
                        .value(measurement.getWeightKg())
                        .build());
            }
        }

        List<VitalsTrendSeriesResponse> series = new ArrayList<>();
        if (!systolic.isEmpty()) {
            series.add(VitalsTrendSeriesResponse.builder()
                    .seriesType("SYSTOLIC_BP")
                    .unit("mmHg")
                    .points(systolic)
                    .build());
        }
        if (!glucose.isEmpty()) {
            series.add(VitalsTrendSeriesResponse.builder()
                    .seriesType("BLOOD_GLUCOSE")
                    .unit("mg/dL")
                    .points(glucose)
                    .build());
        }
        if (!weight.isEmpty()) {
            series.add(VitalsTrendSeriesResponse.builder()
                    .seriesType("WEIGHT")
                    .unit("kg")
                    .points(weight)
                    .build());
        }
        return series;
    }

    private List<TimelineEventResponse> buildRecentTimeline(UUID patientId) {
        List<TimelineEventResponse> events = new ArrayList<>();

        vitalSignRecordRepository.findByPatientIdOrderByRecordedAtDesc(patientId, PageRequest.of(0, 5))
                .getContent()
                .forEach(vital -> events.add(TimelineEventResponse.builder()
                        .eventType("VITAL_RECORDED")
                        .title("Vitals recorded")
                        .description(buildVitalDescription(vital))
                        .occurredAt(vital.getRecordedAt())
                        .referenceId(vital.getId())
                        .build()));

        measurementHistoryRepository.findByPatientIdOrderByMeasuredAtDesc(patientId, PageRequest.of(0, 5))
                .getContent()
                .forEach(measurement -> events.add(TimelineEventResponse.builder()
                        .eventType("MEASUREMENT_RECORDED")
                        .title("Measurements updated")
                        .description(buildMeasurementDescription(measurement))
                        .occurredAt(measurement.getMeasuredAt())
                        .referenceId(measurement.getId())
                        .build()));

        return events.stream()
                .sorted(Comparator.comparing(TimelineEventResponse::getOccurredAt).reversed())
                .limit(5)
                .toList();
    }

    private String buildVitalDescription(VitalSignRecordEntity vital) {
        List<String> parts = new ArrayList<>();
        if (vital.getSystolicBp() != null && vital.getDiastolicBp() != null) {
            parts.add("BP " + vital.getSystolicBp() + "/" + vital.getDiastolicBp());
        }
        if (vital.getHeartRate() != null) {
            parts.add("HR " + vital.getHeartRate());
        }
        if (vital.getBloodGlucose() != null) {
            parts.add("Glucose " + vital.getBloodGlucose());
        }
        return parts.isEmpty() ? "Vital signs entry" : String.join(", ", parts);
    }

    private String buildMeasurementDescription(PhysicalMeasurementHistoryEntity measurement) {
        List<String> parts = new ArrayList<>();
        if (measurement.getWeightKg() != null) {
            parts.add("Weight " + measurement.getWeightKg() + " kg");
        }
        if (measurement.getHeightCm() != null) {
            parts.add("Height " + measurement.getHeightCm() + " cm");
        }
        return parts.isEmpty() ? "Physical measurements entry" : String.join(", ", parts);
    }

    private BigDecimal metricValue(List<MetricResponse> metrics, MetricType type) {
        return metrics.stream()
                .filter(m -> m.getMetricType() == type && m.getValue() != null)
                .map(MetricResponse::getValue)
                .findFirst()
                .orElse(null);
    }

    private int weightProgress(BigDecimal current, BigDecimal target) {
        if (target.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }
        BigDecimal diff = current.subtract(target).abs();
        BigDecimal pct = BigDecimal.ONE.subtract(diff.divide(target, 4, RoundingMode.HALF_UP));
        return clampPercent(pct.multiply(BigDecimal.valueOf(100)).intValue());
    }

    private int ratioProgress(BigDecimal current, BigDecimal target) {
        if (target.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }
        BigDecimal pct = current.divide(target, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        return clampPercent(pct.intValue());
    }

    private int clampPercent(int value) {
        return Math.max(0, Math.min(100, value));
    }
}
