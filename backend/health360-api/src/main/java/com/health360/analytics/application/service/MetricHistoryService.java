package com.health360.analytics.application.service;

import com.health360.analytics.domain.MetricType;
import com.health360.analytics.presentation.dto.response.MetricHistoryPointResponse;
import com.health360.patient.infrastructure.persistence.entity.PhysicalMeasurementHistoryEntity;
import com.health360.patient.infrastructure.persistence.entity.VitalSignRecordEntity;
import com.health360.patient.infrastructure.persistence.repository.PhysicalMeasurementHistoryRepository;
import com.health360.patient.infrastructure.persistence.repository.VitalSignRecordRepository;
import com.health360.analytics.infrastructure.persistence.entity.HealthMetricsSnapshotEntity;
import com.health360.analytics.infrastructure.persistence.repository.HealthMetricsSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MetricHistoryService {

    private final PatientProfileContextAssembler contextAssembler;
    private final VitalSignRecordRepository vitalSignRecordRepository;
    private final PhysicalMeasurementHistoryRepository measurementHistoryRepository;
    private final HealthMetricsSnapshotRepository snapshotRepository;

    @Transactional(readOnly = true)
    public Page<MetricHistoryPointResponse> getHistory(
            UUID userId, UUID tenantId, MetricType metricType,
            Instant fromDate, Instant toDate, Pageable pageable) {

        var ctx = contextAssembler.assemble(userId, tenantId);
        UUID patientId = ctx.patientId();

        List<MetricHistoryPointResponse> points = switch (metricType) {
            case BMI -> buildBmiHistory(patientId, pageable);
            case BP_CLASSIFICATION -> buildVitalHistory(patientId, fromDate, toDate, pageable,
                    VitalField.SYSTOLIC, "mmHg");
            case BLOOD_SUGAR_CLASSIFICATION -> buildVitalHistory(patientId, fromDate, toDate, pageable,
                    VitalField.GLUCOSE, "mg/dL");
            case HEART_RATE_ZONES -> buildVitalHistory(patientId, fromDate, toDate, pageable,
                    VitalField.HEART_RATE, "bpm");
            case WELLNESS_SCORE -> buildSnapshotScoreHistory(patientId, tenantId, pageable, SnapshotField.WELLNESS);
            case HEALTH_RISK_SCORE -> buildSnapshotScoreHistory(patientId, tenantId, pageable, SnapshotField.RISK);
            case PROFILE_COMPLETION -> buildSnapshotScoreHistory(patientId, tenantId, pageable, SnapshotField.COMPLETION);
            default -> List.of();
        };

        return paginate(points, pageable);
    }

    private List<MetricHistoryPointResponse> buildBmiHistory(UUID patientId, Pageable pageable) {
        Page<PhysicalMeasurementHistoryEntity> page = measurementHistoryRepository
                .findByPatientIdOrderByMeasuredAtDesc(patientId, pageable);

        List<MetricHistoryPointResponse> points = new ArrayList<>();
        for (PhysicalMeasurementHistoryEntity record : page.getContent()) {
            if (record.getHeightCm() == null || record.getWeightKg() == null) {
                continue;
            }
            double heightM = record.getHeightCm().doubleValue() / 100.0;
            double bmi = record.getWeightKg().doubleValue() / (heightM * heightM);
            BigDecimal value = BigDecimal.valueOf(bmi).setScale(1, RoundingMode.HALF_UP);
            points.add(MetricHistoryPointResponse.builder()
                    .recordedAt(record.getMeasuredAt())
                    .value(value)
                    .unit("kg/m²")
                    .displayValue(value + " kg/m²")
                    .build());
        }
        return points;
    }

    private List<MetricHistoryPointResponse> buildWeightHistory(UUID patientId, Pageable pageable) {
        Page<PhysicalMeasurementHistoryEntity> page = measurementHistoryRepository
                .findByPatientIdOrderByMeasuredAtDesc(patientId, pageable);

        return page.getContent().stream()
                .filter(r -> r.getWeightKg() != null)
                .map(r -> MetricHistoryPointResponse.builder()
                        .recordedAt(r.getMeasuredAt())
                        .value(r.getWeightKg())
                        .unit("kg")
                        .displayValue(r.getWeightKg() + " kg")
                        .build())
                .toList();
    }

    private List<MetricHistoryPointResponse> buildVitalHistory(
            UUID patientId, Instant from, Instant to, Pageable pageable,
            VitalField field, String unit) {

        Page<VitalSignRecordEntity> page;
        if (from != null && to != null) {
            page = vitalSignRecordRepository.findByPatientIdAndRecordedAtBetweenOrderByRecordedAtDesc(
                    patientId, from, to, pageable);
        } else {
            page = vitalSignRecordRepository.findByPatientIdOrderByRecordedAtDesc(patientId, pageable);
        }

        return page.getContent().stream()
                .map(r -> extractVital(r, field, unit))
                .filter(p -> p != null)
                .toList();
    }

    private MetricHistoryPointResponse extractVital(VitalSignRecordEntity record, VitalField field, String unit) {
        BigDecimal value = switch (field) {
            case SYSTOLIC -> record.getSystolicBp() != null
                    ? BigDecimal.valueOf(record.getSystolicBp()) : null;
            case GLUCOSE -> record.getBloodGlucose();
            case HEART_RATE -> record.getHeartRate() != null
                    ? BigDecimal.valueOf(record.getHeartRate()) : null;
        };
        if (value == null) {
            return null;
        }
        String display = field == VitalField.SYSTOLIC && record.getDiastolicBp() != null
                ? record.getSystolicBp() + "/" + record.getDiastolicBp() + " mmHg"
                : value.stripTrailingZeros().toPlainString() + " " + unit;

        return MetricHistoryPointResponse.builder()
                .recordedAt(record.getRecordedAt())
                .value(value)
                .unit(unit)
                .displayValue(display)
                .build();
    }

    private List<MetricHistoryPointResponse> buildSnapshotScoreHistory(
            UUID patientId, UUID tenantId, Pageable pageable, SnapshotField field) {

        Page<HealthMetricsSnapshotEntity> page = snapshotRepository
                .findByPatientIdAndTenantIdOrderByCalculatedAtDesc(patientId, tenantId, pageable);

        return page.getContent().stream()
                .map(snapshot -> {
                    Integer score = switch (field) {
                        case WELLNESS -> snapshot.getWellnessScore();
                        case RISK -> snapshot.getHealthRiskScore();
                        case COMPLETION -> snapshot.getProfileCompletionAtCalc();
                    };
                    if (score == null) {
                        return null;
                    }
                    return MetricHistoryPointResponse.builder()
                            .recordedAt(snapshot.getCalculatedAt())
                            .value(BigDecimal.valueOf(score))
                            .unit("score")
                            .displayValue(String.valueOf(score))
                            .build();
                })
                .filter(p -> p != null)
                .toList();
    }

    private Page<MetricHistoryPointResponse> paginate(List<MetricHistoryPointResponse> points, Pageable pageable) {
        List<MetricHistoryPointResponse> sorted = points.stream()
                .sorted(Comparator.comparing(MetricHistoryPointResponse::getRecordedAt).reversed())
                .toList();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), sorted.size());
        if (start >= sorted.size()) {
            return new PageImpl<>(List.of(), pageable, sorted.size());
        }
        return new PageImpl<>(sorted.subList(start, end), pageable, sorted.size());
    }

    private enum VitalField {
        SYSTOLIC, GLUCOSE, HEART_RATE
    }

    private enum SnapshotField {
        WELLNESS, RISK, COMPLETION
    }
}
