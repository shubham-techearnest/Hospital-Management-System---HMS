package com.health360.analytics.application.service;

import com.health360.analytics.domain.CalculatedMetric;
import com.health360.analytics.domain.ClassificationLevel;
import com.health360.analytics.domain.MetricType;
import com.health360.analytics.domain.PatientProfileContext;
import com.health360.patient.application.service.BpClassificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class FormulaEngineTest {

    private FormulaEngineService formulaEngineService;

    @BeforeEach
    void setUp() {
        formulaEngineService = new FormulaEngineService(new BpClassificationService());
    }

    @Test
    void bmiDoc08TestVector() {
        CalculatedMetric bmi = metric(baseContext()
                .heightCm(new BigDecimal("170"))
                .weightKg(new BigDecimal("70"))
                .build(), MetricType.BMI);

        assertThat(bmi.value()).isEqualByComparingTo(new BigDecimal("24.2"));
        assertThat(bmi.classification()).isEqualTo(ClassificationLevel.NORMAL);
    }

    @Test
    void bmrMaleDoc08TestVector() {
        CalculatedMetric bmr = metric(contextWithAge(30, "MALE")
                .heightCm(new BigDecimal("170"))
                .weightKg(new BigDecimal("70"))
                .build(), MetricType.BMR);

        assertThat(bmr.value().intValue()).isEqualTo(1618);
    }

    @Test
    void bmrFemaleDoc08TestVector() {
        CalculatedMetric bmr = metric(contextWithAge(30, "FEMALE")
                .heightCm(new BigDecimal("160"))
                .weightKg(new BigDecimal("60"))
                .build(), MetricType.BMR);

        assertThat(bmr.value().intValue()).isEqualTo(1289);
    }

    @Test
    void idealWeightMaleDoc08TestVector() {
        CalculatedMetric ideal = metric(contextWithAge(30, "MALE")
                .heightCm(new BigDecimal("170"))
                .build(), MetricType.IDEAL_WEIGHT);

        assertThat(ideal.value()).isEqualByComparingTo(new BigDecimal("65.9"));
    }

    @Test
    void bsaDoc08TestVector() {
        CalculatedMetric bsa = metric(baseContext()
                .heightCm(new BigDecimal("170"))
                .weightKg(new BigDecimal("70"))
                .build(), MetricType.BODY_SURFACE_AREA);

        assertThat(bsa.value()).isEqualByComparingTo(new BigDecimal("1.81"));
    }

    @Test
    void whrMaleDoc08TestVector() {
        CalculatedMetric whr = metric(contextWithAge(30, "MALE")
                .waistCm(new BigDecimal("85"))
                .hipCm(new BigDecimal("100"))
                .build(), MetricType.WAIST_HIP_RATIO);

        assertThat(whr.value()).isEqualByComparingTo(new BigDecimal("0.85"));
        assertThat(whr.classification()).isEqualTo(ClassificationLevel.NORMAL);
    }

    @Test
    void whtrDoc08TestVector() {
        CalculatedMetric whtr = metric(baseContext()
                .waistCm(new BigDecimal("85"))
                .heightCm(new BigDecimal("170"))
                .build(), MetricType.WAIST_HEIGHT_RATIO);

        assertThat(whtr.value()).isEqualByComparingTo(new BigDecimal("0.50"));
        assertThat(whtr.classification()).isEqualTo(ClassificationLevel.WARNING);
    }

    @Test
    void bpNormalDoc08TestVector() {
        CalculatedMetric bp = metric(baseContext()
                .latestVitals(new PatientProfileContext.LatestVitals(118, 76, null, null, null, null))
                .build(), MetricType.BP_CLASSIFICATION);

        assertThat(bp.classification()).isEqualTo(ClassificationLevel.NORMAL);
    }

    @Test
    void bpCriticalDoc08TestVector() {
        CalculatedMetric bp = metric(baseContext()
                .latestVitals(new PatientProfileContext.LatestVitals(145, 92, null, null, null, null))
                .build(), MetricType.BP_CLASSIFICATION);

        assertThat(bp.classification()).isEqualTo(ClassificationLevel.CRITICAL);
    }

    @Test
    void glucoseNormalDoc08TestVector() {
        CalculatedMetric glucose = metric(baseContext()
                .latestVitals(new PatientProfileContext.LatestVitals(
                        null, null, null, null, new BigDecimal("92"), "FASTING"))
                .build(), MetricType.BLOOD_SUGAR_CLASSIFICATION);

        assertThat(glucose.classification()).isEqualTo(ClassificationLevel.NORMAL);
    }

    @Test
    void glucoseWarningDoc08TestVector() {
        CalculatedMetric glucose = metric(baseContext()
                .latestVitals(new PatientProfileContext.LatestVitals(
                        null, null, null, null, new BigDecimal("110"), "FASTING"))
                .build(), MetricType.BLOOD_SUGAR_CLASSIFICATION);

        assertThat(glucose.classification()).isEqualTo(ClassificationLevel.WARNING);
    }

    @Test
    void disclaimerConstantPresent() {
        assertThat(FormulaEngineService.DISCLAIMER).contains("not a medical diagnosis");
    }

    private CalculatedMetric metric(PatientProfileContext ctx, MetricType type) {
        return formulaEngineService.calculateAll(ctx).stream()
                .filter(m -> m.metricType() == type)
                .findFirst()
                .orElseThrow();
    }

    private ContextBuilder baseContext() {
        return contextWithAge(30, "MALE");
    }

    private ContextBuilder contextWithAge(int age, String gender) {
        return new ContextBuilder()
                .patientId(UUID.randomUUID())
                .tenantId(UUID.randomUUID())
                .dateOfBirth(LocalDate.now().minusYears(age))
                .gender(gender);
    }

    private static final class ContextBuilder {
        private UUID patientId;
        private UUID tenantId;
        private LocalDate dateOfBirth;
        private String gender;
        private BigDecimal heightCm;
        private BigDecimal weightKg;
        private BigDecimal waistCm;
        private BigDecimal hipCm;
        private PatientProfileContext.LatestVitals latestVitals;

        ContextBuilder patientId(UUID patientId) {
            this.patientId = patientId;
            return this;
        }

        ContextBuilder tenantId(UUID tenantId) {
            this.tenantId = tenantId;
            return this;
        }

        ContextBuilder dateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
            return this;
        }

        ContextBuilder gender(String gender) {
            this.gender = gender;
            return this;
        }

        ContextBuilder heightCm(BigDecimal heightCm) {
            this.heightCm = heightCm;
            return this;
        }

        ContextBuilder weightKg(BigDecimal weightKg) {
            this.weightKg = weightKg;
            return this;
        }

        ContextBuilder waistCm(BigDecimal waistCm) {
            this.waistCm = waistCm;
            return this;
        }

        ContextBuilder hipCm(BigDecimal hipCm) {
            this.hipCm = hipCm;
            return this;
        }

        ContextBuilder latestVitals(PatientProfileContext.LatestVitals latestVitals) {
            this.latestVitals = latestVitals;
            return this;
        }

        PatientProfileContext build() {
            return new PatientProfileContext(
                    patientId,
                    tenantId,
                    dateOfBirth,
                    gender,
                    null,
                    null,
                    null,
                    null,
                    heightCm,
                    weightKg,
                    waistCm,
                    hipCm,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    latestVitals,
                    null,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0);
        }
    }
}
