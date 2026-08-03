package com.health360.analytics.application.service;

import com.health360.analytics.domain.CalculatedMetric;
import com.health360.analytics.domain.ClassificationLevel;
import com.health360.analytics.domain.MetricType;
import com.health360.analytics.domain.PatientProfileContext;
import com.health360.patient.application.service.BpClassificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FormulaEngineService {

    public static final String DISCLAIMER =
            "This is not a medical diagnosis. Consult a healthcare professional for medical advice.";

    private static final BigDecimal CLIMATE_MULTIPLIER = new BigDecimal("1.1");

    private final BpClassificationService bpClassificationService;

    public List<CalculatedMetric> calculateAll(PatientProfileContext ctx) {
        Map<MetricType, CalculatedMetric> computed = new LinkedHashMap<>();

        computed.put(MetricType.PROFILE_COMPLETION, calculateProfileCompletion(ctx));
        computed.put(MetricType.BMI, calculateBmi(ctx));
        computed.put(MetricType.BMR, calculateBmr(ctx));
        computed.put(MetricType.IDEAL_WEIGHT, calculateIdealWeight(ctx));
        computed.put(MetricType.LEAN_BODY_MASS, calculateLeanBodyMass(ctx));
        computed.put(MetricType.BODY_FAT_PERCENT, calculateBodyFatPercent(ctx));
        computed.put(MetricType.BODY_SURFACE_AREA, calculateBodySurfaceArea(ctx));
        computed.put(MetricType.HEALTHY_WEIGHT_RANGE, calculateHealthyWeightRange(ctx));
        computed.put(MetricType.PROTEIN_REQUIREMENT, calculateProteinRequirement(ctx));
        computed.put(MetricType.WATER_INTAKE, calculateWaterIntake(ctx));
        computed.put(MetricType.DAILY_CALORIES, calculateDailyCalories(ctx, computed.get(MetricType.BMR)));
        computed.put(MetricType.SLEEP_RECOMMENDATION, calculateSleepRecommendation(ctx));
        computed.put(MetricType.DAILY_STEP_GOAL, calculateDailyStepGoal(ctx));
        computed.put(MetricType.HEART_RATE_ZONES, calculateHeartRateZones(ctx));
        computed.put(MetricType.BP_CLASSIFICATION, calculateBpClassification(ctx));
        computed.put(MetricType.BLOOD_SUGAR_CLASSIFICATION, calculateBloodSugarClassification(ctx));
        computed.put(MetricType.WAIST_HIP_RATIO, calculateWaistHipRatio(ctx));
        computed.put(MetricType.WAIST_HEIGHT_RATIO, calculateWaistHeightRatio(ctx));
        computed.put(MetricType.WELLNESS_SCORE, calculateWellnessScore(ctx, computed));
        computed.put(MetricType.HEALTH_RISK_SCORE, calculateHealthRiskScore(ctx, computed));

        return new ArrayList<>(computed.values());
    }

    private CalculatedMetric calculateProfileCompletion(PatientProfileContext ctx) {
        int score = 0;
        if (ctx.dateOfBirth() != null && isPresent(ctx.gender())) {
            score += 15;
        }
        if (isPresent(ctx.primaryPhone()) && isPresent(ctx.permanentAddressLine1())
                && isPresent(ctx.permanentCity()) && isPresent(ctx.permanentPincode())) {
            score += 10;
        }
        if (ctx.heightCm() != null && ctx.weightKg() != null) {
            score += 15;
        }
        if (ctx.allergyCount() + ctx.medicationCount() + ctx.conditionCount() > 0) {
            score += 15;
        }
        if (isPresent(ctx.smokingStatus()) && isPresent(ctx.exerciseFrequency())
                && ctx.averageSleepHours() != null) {
            score += 10;
        }
        if (ctx.emergencyContactCount() > 0) {
            score += 5;
        }
        if (ctx.vitalCount() > 0) {
            score += 10;
        }
        if (ctx.labCount() > 0) {
            score += 5;
        }
        if (hasAnyGoal(ctx)) {
            score += 5;
        }
        if (ctx.documentCount() > 0) {
            score += 10;
        }

        ClassificationLevel level = profileCompletionLevel(score);
        String label = profileCompletionLabel(score);
        return new CalculatedMetric(
                MetricType.PROFILE_COMPLETION,
                BigDecimal.valueOf(score),
                "percent",
                level,
                "Your profile is " + score + "% complete (" + label + ").",
                List.of(),
                score + "%");
    }

    private CalculatedMetric calculateBmi(PatientProfileContext ctx) {
        List<String> missing = missingFields(ctx.heightCm(), "heightCm", ctx.weightKg(), "weightKg");
        if (!missing.isEmpty()) {
            return CalculatedMetric.insufficient(MetricType.BMI, missing);
        }

        double heightM = ctx.heightCm().doubleValue() / 100.0;
        double bmi = ctx.weightKg().doubleValue() / (heightM * heightM);
        BigDecimal value = scale(bmi, 1);

        ClassificationLevel level;
        String interpretation;
        if (bmi < 18.5) {
            level = ClassificationLevel.WARNING;
            interpretation = "Your BMI of " + value + " is below the healthy range. Consider consulting a nutritionist.";
        } else if (bmi < 25.0) {
            level = ClassificationLevel.NORMAL;
            interpretation = "Your BMI of " + value + " is within the healthy weight range (18.5–24.9).";
        } else if (bmi < 30.0) {
            level = ClassificationLevel.WARNING;
            interpretation = "Your BMI of " + value + " indicates overweight. Lifestyle changes may help.";
        } else {
            level = ClassificationLevel.CRITICAL;
            interpretation = "Your BMI of " + value + " indicates obesity. Please consult a healthcare professional.";
        }

        return new CalculatedMetric(MetricType.BMI, value, "kg/m²", level, interpretation, List.of(), null);
    }

    private CalculatedMetric calculateBmr(PatientProfileContext ctx) {
        List<String> missing = new ArrayList<>();
        if (ctx.weightKg() == null) {
            missing.add("weightKg");
        }
        if (ctx.heightCm() == null) {
            missing.add("heightCm");
        }
        if (ctx.dateOfBirth() == null) {
            missing.add("dateOfBirth");
        }
        if (!isPresent(ctx.gender())) {
            missing.add("gender");
        }
        if (!missing.isEmpty()) {
            return CalculatedMetric.insufficient(MetricType.BMR, missing);
        }

        int age = ageYears(ctx.dateOfBirth());
        if (age < 1) {
            return CalculatedMetric.insufficient(MetricType.BMR, List.of("dateOfBirth"));
        }

        double bmr = bmrValue(ctx.gender(), ctx.weightKg().doubleValue(), ctx.heightCm().doubleValue(), age);
        int rounded = (int) Math.round(bmr);
        return new CalculatedMetric(
                MetricType.BMR,
                BigDecimal.valueOf(rounded),
                "kcal/day",
                ClassificationLevel.NORMAL,
                "Your estimated basal metabolic rate is " + rounded + " kcal/day — the energy your body needs at rest.",
                List.of(),
                null);
    }

    private CalculatedMetric calculateIdealWeight(PatientProfileContext ctx) {
        List<String> missing = new ArrayList<>();
        if (ctx.heightCm() == null) {
            missing.add("heightCm");
        }
        if (!isPresent(ctx.gender())) {
            missing.add("gender");
        }
        if (!missing.isEmpty()) {
            return CalculatedMetric.insufficient(MetricType.IDEAL_WEIGHT, missing);
        }

        double ibw = idealWeightKg(ctx.gender(), ctx.heightCm().doubleValue());
        BigDecimal value = scale(ibw, 1);

        ClassificationLevel level = ClassificationLevel.NORMAL;
        String interpretation = "Your ideal body weight is approximately " + value + " kg based on your height.";
        if (ctx.weightKg() != null) {
            double deviation = Math.abs(ctx.weightKg().doubleValue() - ibw) / ibw;
            if (deviation <= 0.10) {
                level = ClassificationLevel.NORMAL;
            } else if (deviation <= 0.20) {
                level = ClassificationLevel.WARNING;
            } else {
                level = ClassificationLevel.CRITICAL;
            }
        }

        return new CalculatedMetric(MetricType.IDEAL_WEIGHT, value, "kg", level, interpretation, List.of(), null);
    }

    private CalculatedMetric calculateLeanBodyMass(PatientProfileContext ctx) {
        List<String> missing = new ArrayList<>();
        if (ctx.weightKg() == null) {
            missing.add("weightKg");
        }
        if (ctx.heightCm() == null) {
            missing.add("heightCm");
        }
        if (!isPresent(ctx.gender())) {
            missing.add("gender");
        }
        if (!missing.isEmpty()) {
            return CalculatedMetric.insufficient(MetricType.LEAN_BODY_MASS, missing);
        }

        double lbm;
        if (ctx.bodyFatPercent() != null) {
            lbm = ctx.weightKg().doubleValue() * (1.0 - ctx.bodyFatPercent().doubleValue() / 100.0);
        } else if (isMale(ctx.gender())) {
            lbm = (0.407 * ctx.weightKg().doubleValue()) + (0.267 * ctx.heightCm().doubleValue()) - 19.2;
        } else if (isFemale(ctx.gender())) {
            lbm = (0.252 * ctx.weightKg().doubleValue()) + (0.473 * ctx.heightCm().doubleValue()) - 48.3;
        } else {
            double male = (0.407 * ctx.weightKg().doubleValue()) + (0.267 * ctx.heightCm().doubleValue()) - 19.2;
            double female = (0.252 * ctx.weightKg().doubleValue()) + (0.473 * ctx.heightCm().doubleValue()) - 48.3;
            lbm = (male + female) / 2.0;
        }

        BigDecimal value = scale(lbm, 1);
        double percent = (lbm / ctx.weightKg().doubleValue()) * 100.0;
        return new CalculatedMetric(
                MetricType.LEAN_BODY_MASS,
                value,
                "kg",
                ClassificationLevel.NORMAL,
                String.format(Locale.US, "Your estimated lean body mass is %s kg (%.0f%% of total body weight).",
                        value, percent),
                List.of(),
                null);
    }

    private CalculatedMetric calculateBodyFatPercent(PatientProfileContext ctx) {
        if (ctx.bodyFatPercent() == null) {
            return CalculatedMetric.insufficient(MetricType.BODY_FAT_PERCENT, List.of("bodyFatPercent"));
        }

        double bf = ctx.bodyFatPercent().doubleValue();
        if (bf < 1 || bf > 70) {
            return CalculatedMetric.insufficient(MetricType.BODY_FAT_PERCENT, List.of("bodyFatPercent"));
        }

        ClassificationLevel level;
        if (isMale(ctx.gender())) {
            if (bf < 6) {
                level = ClassificationLevel.CRITICAL;
            } else if (bf <= 24) {
                level = ClassificationLevel.NORMAL;
            } else if (bf <= 29) {
                level = ClassificationLevel.WARNING;
            } else {
                level = ClassificationLevel.CRITICAL;
            }
        } else if (isFemale(ctx.gender())) {
            if (bf < 14) {
                level = ClassificationLevel.CRITICAL;
            } else if (bf <= 31) {
                level = ClassificationLevel.NORMAL;
            } else if (bf <= 36) {
                level = ClassificationLevel.WARNING;
            } else {
                level = ClassificationLevel.CRITICAL;
            }
        } else {
            level = ClassificationLevel.NORMAL;
        }

        return new CalculatedMetric(
                MetricType.BODY_FAT_PERCENT,
                ctx.bodyFatPercent(),
                "%",
                level,
                "Your body fat percentage of " + ctx.bodyFatPercent() + "% is classified for your gender.",
                List.of(),
                null);
    }

    private CalculatedMetric calculateBodySurfaceArea(PatientProfileContext ctx) {
        List<String> missing = missingFields(ctx.heightCm(), "heightCm", ctx.weightKg(), "weightKg");
        if (!missing.isEmpty()) {
            return CalculatedMetric.insufficient(MetricType.BODY_SURFACE_AREA, missing);
        }

        double bsa = 0.007184 * Math.pow(ctx.weightKg().doubleValue(), 0.425)
                * Math.pow(ctx.heightCm().doubleValue(), 0.725);
        BigDecimal value = scale(bsa, 2);
        return new CalculatedMetric(
                MetricType.BODY_SURFACE_AREA,
                value,
                "m²",
                ClassificationLevel.NORMAL,
                "Your body surface area is " + value + " m².",
                List.of(),
                null);
    }

    private CalculatedMetric calculateHealthyWeightRange(PatientProfileContext ctx) {
        if (ctx.heightCm() == null) {
            return CalculatedMetric.insufficient(MetricType.HEALTHY_WEIGHT_RANGE, List.of("heightCm"));
        }

        double heightM = ctx.heightCm().doubleValue() / 100.0;
        double min = 18.5 * heightM * heightM;
        double max = 24.9 * heightM * heightM;
        BigDecimal minKg = scale(min, 1);
        BigDecimal maxKg = scale(max, 1);
        String display = minKg + "–" + maxKg + " kg";

        ClassificationLevel level = ClassificationLevel.NORMAL;
        String interpretation = "For your height, a healthy weight range is " + display + ".";
        if (ctx.weightKg() != null) {
            double weight = ctx.weightKg().doubleValue();
            if (weight >= min && weight <= max) {
                level = ClassificationLevel.NORMAL;
            } else {
                double boundary = weight < min ? min : max;
                double deviation = Math.abs(weight - boundary) / boundary;
                level = deviation <= 0.10 ? ClassificationLevel.WARNING : ClassificationLevel.CRITICAL;
            }
            interpretation += " Your current weight is " + ctx.weightKg() + " kg.";
        }

        return new CalculatedMetric(
                MetricType.HEALTHY_WEIGHT_RANGE,
                null,
                "kg",
                level,
                interpretation,
                List.of(),
                display);
    }

    private CalculatedMetric calculateProteinRequirement(PatientProfileContext ctx) {
        if (ctx.weightKg() == null) {
            return CalculatedMetric.insufficient(MetricType.PROTEIN_REQUIREMENT, List.of("weightKg", "exerciseFrequency"));
        }

        double multiplier = proteinMultiplier(ctx);
        int grams = (int) Math.round(ctx.weightKg().doubleValue() * multiplier);
        return new CalculatedMetric(
                MetricType.PROTEIN_REQUIREMENT,
                BigDecimal.valueOf(grams),
                "g/day",
                ClassificationLevel.NORMAL,
                "Based on your weight and activity level, aim for approximately " + grams + " g of protein per day.",
                List.of(),
                null);
    }

    private CalculatedMetric calculateWaterIntake(PatientProfileContext ctx) {
        if (ctx.weightKg() == null) {
            return CalculatedMetric.insufficient(MetricType.WATER_INTAKE, List.of("weightKg", "exerciseFrequency"));
        }

        double base = ctx.weightKg().doubleValue() * 35.0;
        double activity = waterActivityMultiplier(ctx.exerciseFrequency());
        double ml = base * activity * CLIMATE_MULTIPLIER.doubleValue();
        int activityLevel = activityLevel(ctx.exerciseFrequency());
        int minFloor = 1500;
        int maxCap = activityLevel >= 4 ? 5000 : 4000;
        int rounded = (int) Math.round(Math.min(maxCap, Math.max(minFloor, ml)));

        String liters = scale(rounded / 1000.0, 1) + " L";
        return new CalculatedMetric(
                MetricType.WATER_INTAKE,
                BigDecimal.valueOf(rounded),
                "ml/day",
                ClassificationLevel.NORMAL,
                "Aim to drink approximately " + rounded + " ml (" + liters + ") of water daily.",
                List.of(),
                liters);
    }

    private CalculatedMetric calculateDailyCalories(PatientProfileContext ctx, CalculatedMetric bmrMetric) {
        if (bmrMetric.classification() == ClassificationLevel.INSUFFICIENT_DATA || bmrMetric.value() == null) {
            return CalculatedMetric.insufficient(MetricType.DAILY_CALORIES, List.of("weightKg", "heightCm", "dateOfBirth", "gender"));
        }

        double bmr = bmrMetric.value().doubleValue();
        double tdee = bmr * activityFactor(ctx.exerciseFrequency());
        String goalMode = "maintain";

        if (ctx.targetWeightKg() != null && ctx.weightKg() != null) {
            if (ctx.targetWeightKg().compareTo(ctx.weightKg()) < 0) {
                tdee -= 500;
                goalMode = "lose";
                double minSafe = bmr * 1.1;
                if (tdee < minSafe) {
                    tdee = minSafe;
                }
            } else if (ctx.targetWeightKg().compareTo(ctx.weightKg()) > 0) {
                tdee += 300;
                goalMode = "gain";
            }
        }

        int rounded = (int) Math.round(tdee);
        ClassificationLevel level = ClassificationLevel.NORMAL;
        if (ctx.targetWeightKg() != null && ctx.weightKg() != null
                && ctx.targetWeightKg().compareTo(ctx.weightKg()) < 0
                && rounded <= bmr * 1.1) {
            level = ClassificationLevel.WARNING;
        }

        return new CalculatedMetric(
                MetricType.DAILY_CALORIES,
                BigDecimal.valueOf(rounded),
                "kcal/day",
                level,
                "Your estimated daily calorie need is " + rounded + " kcal to " + goalMode + " weight.",
                List.of(),
                null);
    }

    private CalculatedMetric calculateSleepRecommendation(PatientProfileContext ctx) {
        if (ctx.dateOfBirth() == null) {
            return CalculatedMetric.insufficient(MetricType.SLEEP_RECOMMENDATION, List.of("dateOfBirth", "averageSleepHours"));
        }

        int age = ageYears(ctx.dateOfBirth());
        double minHours = age >= 65 ? 7.0 : 7.0;
        double maxHours = age >= 65 ? 8.0 : 9.0;
        String display = minHours + "–" + maxHours + " hours";

        if (ctx.averageSleepHours() == null) {
            return new CalculatedMetric(
                    MetricType.SLEEP_RECOMMENDATION,
                    null,
                    "hours",
                    ClassificationLevel.INSUFFICIENT_DATA,
                    "For your age group, " + display + " of sleep is recommended.",
                    List.of("averageSleepHours"),
                    display);
        }

        double actual = ctx.averageSleepHours().doubleValue();
        ClassificationLevel level;
        double diffLow = minHours - actual;
        double diffHigh = actual - maxHours;
        if (actual >= minHours && actual <= maxHours) {
            level = ClassificationLevel.NORMAL;
        } else if (actual < 5.0 || diffLow >= 2.0 || diffHigh >= 2.0) {
            level = ClassificationLevel.CRITICAL;
        } else {
            level = ClassificationLevel.WARNING;
        }

        return new CalculatedMetric(
                MetricType.SLEEP_RECOMMENDATION,
                ctx.averageSleepHours(),
                "hours",
                level,
                "For your age group, " + display + " of sleep is recommended. You report averaging "
                        + actual + " hours.",
                List.of(),
                display);
    }

    private CalculatedMetric calculateDailyStepGoal(PatientProfileContext ctx) {
        if (ctx.dateOfBirth() == null) {
            return CalculatedMetric.insufficient(MetricType.DAILY_STEP_GOAL, List.of("dateOfBirth", "exerciseFrequency"));
        }

        int age = ageYears(ctx.dateOfBirth());
        int base = age <= 40 ? 10_000 : age <= 60 ? 8_000 : 7_000;
        int activityLevel = activityLevel(ctx.exerciseFrequency());
        if (activityLevel >= 5) {
            base += 4_000;
        } else if (activityLevel >= 4) {
            base += 2_000;
        }

        if (ctx.dailyStepsGoal() != null) {
            return new CalculatedMetric(
                    MetricType.DAILY_STEP_GOAL,
                    BigDecimal.valueOf(base),
                    "steps/day",
                    ClassificationLevel.NORMAL,
                    "Recommended " + base + " steps/day; your goal is set to " + ctx.dailyStepsGoal() + " steps.",
                    List.of(),
                    String.valueOf(base));
        }

        return new CalculatedMetric(
                MetricType.DAILY_STEP_GOAL,
                BigDecimal.valueOf(base),
                "steps/day",
                ClassificationLevel.NORMAL,
                "A daily step goal of " + base + " steps supports your cardiovascular health.",
                List.of(),
                String.valueOf(base));
    }

    private CalculatedMetric calculateHeartRateZones(PatientProfileContext ctx) {
        if (ctx.dateOfBirth() == null) {
            return CalculatedMetric.insufficient(MetricType.HEART_RATE_ZONES, List.of("dateOfBirth"));
        }

        int age = ageYears(ctx.dateOfBirth());
        int maxHr = 220 - age;
        int resting = ctx.latestVitals() != null && ctx.latestVitals().heartRate() != null
                ? ctx.latestVitals().heartRate() : 70;
        int hrr = maxHr - resting;

        int z1Min = zoneBpm(resting, hrr, 0.50);
        int z1Max = zoneBpm(resting, hrr, 0.60);
        int z5Max = zoneBpm(resting, hrr, 1.00);
        String display = z1Min + "–" + z5Max + " bpm";

        String hrNote = ctx.latestVitals() != null && ctx.latestVitals().heartRate() != null
                ? " and resting heart rate" : "";
        return new CalculatedMetric(
                MetricType.HEART_RATE_ZONES,
                null,
                "bpm",
                ClassificationLevel.NORMAL,
                "Based on your age" + hrNote + ", your training zones range from " + z1Min + " to " + z5Max + " bpm.",
                List.of(),
                display);
    }

    private CalculatedMetric calculateBpClassification(PatientProfileContext ctx) {
        if (ctx.latestVitals() == null
                || ctx.latestVitals().systolicBp() == null
                || ctx.latestVitals().diastolicBp() == null) {
            return CalculatedMetric.insufficient(MetricType.BP_CLASSIFICATION, List.of("systolicBp", "diastolicBp"));
        }

        var bp = bpClassificationService.classify(
                ctx.latestVitals().systolicBp(), ctx.latestVitals().diastolicBp());
        if (bp == null) {
            return CalculatedMetric.insufficient(MetricType.BP_CLASSIFICATION, List.of("systolicBp", "diastolicBp"));
        }

        ClassificationLevel level = mapStringClassification(bp.category());
        String display = ctx.latestVitals().systolicBp() + "/" + ctx.latestVitals().diastolicBp() + " mmHg";
        return new CalculatedMetric(
                MetricType.BP_CLASSIFICATION,
                null,
                "mmHg",
                level,
                bp.interpretation(),
                List.of(),
                display);
    }

    private CalculatedMetric calculateBloodSugarClassification(PatientProfileContext ctx) {
        if (ctx.latestVitals() == null || ctx.latestVitals().bloodGlucose() == null) {
            return CalculatedMetric.insufficient(MetricType.BLOOD_SUGAR_CLASSIFICATION,
                    List.of("bloodGlucose", "glucoseReadingType"));
        }

        String readingType = ctx.latestVitals().glucoseReadingType();
        if (!isPresent(readingType)) {
            return CalculatedMetric.insufficient(MetricType.BLOOD_SUGAR_CLASSIFICATION, List.of("glucoseReadingType"));
        }

        double glucose = ctx.latestVitals().bloodGlucose().doubleValue();
        ClassificationLevel level = glucoseLevel(glucose, readingType);
        String typeLabel = readingType.toLowerCase(Locale.ROOT).replace('_', ' ');
        return new CalculatedMetric(
                MetricType.BLOOD_SUGAR_CLASSIFICATION,
                ctx.latestVitals().bloodGlucose(),
                "mg/dL",
                level,
                "Your " + typeLabel + " blood glucose of " + glucose + " mg/dL is classified as " + level + ".",
                List.of(),
                glucose + " mg/dL");
    }

    private CalculatedMetric calculateWaistHipRatio(PatientProfileContext ctx) {
        List<String> missing = missingFields(ctx.waistCm(), "waistCm", ctx.hipCm(), "hipCm");
        if (!missing.isEmpty()) {
            return CalculatedMetric.insufficient(MetricType.WAIST_HIP_RATIO, missing);
        }

        double whr = ctx.waistCm().doubleValue() / ctx.hipCm().doubleValue();
        BigDecimal value = scale(whr, 2);

        ClassificationLevel level;
        if (isMale(ctx.gender())) {
            if (whr < 0.90) {
                level = ClassificationLevel.NORMAL;
            } else if (whr < 1.00) {
                level = ClassificationLevel.WARNING;
            } else {
                level = ClassificationLevel.CRITICAL;
            }
        } else if (isFemale(ctx.gender())) {
            if (whr < 0.80) {
                level = ClassificationLevel.NORMAL;
            } else if (whr < 0.85) {
                level = ClassificationLevel.WARNING;
            } else {
                level = ClassificationLevel.CRITICAL;
            }
        } else {
            level = whr < 0.85 ? ClassificationLevel.NORMAL : ClassificationLevel.WARNING;
        }

        String risk = level == ClassificationLevel.NORMAL ? "low" : level == ClassificationLevel.WARNING ? "moderate" : "high";
        return new CalculatedMetric(
                MetricType.WAIST_HIP_RATIO,
                value,
                "ratio",
                level,
                "Your waist-to-hip ratio of " + value + " indicates " + risk + " abdominal fat risk for your gender.",
                List.of(),
                null);
    }

    private CalculatedMetric calculateWaistHeightRatio(PatientProfileContext ctx) {
        List<String> missing = missingFields(ctx.waistCm(), "waistCm", ctx.heightCm(), "heightCm");
        if (!missing.isEmpty()) {
            return CalculatedMetric.insufficient(MetricType.WAIST_HEIGHT_RATIO, missing);
        }

        double whtr = ctx.waistCm().doubleValue() / ctx.heightCm().doubleValue();
        BigDecimal value = scale(whtr, 2);

        ClassificationLevel level;
        if (whtr < 0.50) {
            level = ClassificationLevel.NORMAL;
        } else if (whtr < 0.60) {
            level = ClassificationLevel.WARNING;
        } else {
            level = ClassificationLevel.CRITICAL;
        }

        return new CalculatedMetric(
                MetricType.WAIST_HEIGHT_RATIO,
                value,
                "ratio",
                level,
                "Your waist-to-height ratio is " + value + ". A ratio below 0.5 is generally considered healthy.",
                List.of(),
                null);
    }

    private CalculatedMetric calculateWellnessScore(PatientProfileContext ctx, Map<MetricType, CalculatedMetric> computed) {
        CalculatedMetric completion = computed.get(MetricType.PROFILE_COMPLETION);
        int completionScore = completion.value() != null ? completion.value().intValue() : 0;
        if (completionScore < 60) {
            return CalculatedMetric.insufficient(MetricType.WELLNESS_SCORE, List.of("profileCompletion"));
        }

        double bmiScore = subScore(computed.get(MetricType.BMI));
        double bpScore = bpSubScore(computed.get(MetricType.BP_CLASSIFICATION));
        double lifestyleScore = lifestyleScore(ctx);
        double vitalsScore = vitalsScore(ctx, computed);
        double completionFactor = completionScore / 100.0;
        double goalsScore = goalsScore(ctx);

        double wellness = (bmiScore * 0.20 + bpScore * 0.15 + lifestyleScore * 0.25
                + vitalsScore * 0.15 + completionFactor * 0.10 + goalsScore * 0.15) * 100.0;
        int score = (int) Math.round(wellness);
        String label = wellnessLabel(score);
        ClassificationLevel level = wellnessLevel(score);

        return new CalculatedMetric(
                MetricType.WELLNESS_SCORE,
                BigDecimal.valueOf(score),
                "score",
                level,
                "Your Wellness Score is " + score + "/100 (" + label + ").",
                List.of(),
                score + "/100");
    }

    private CalculatedMetric calculateHealthRiskScore(PatientProfileContext ctx, Map<MetricType, CalculatedMetric> computed) {
        boolean medicalComplete = ctx.allergyCount() + ctx.medicationCount() + ctx.conditionCount() > 0;
        boolean lifestyleComplete = isPresent(ctx.smokingStatus()) && isPresent(ctx.exerciseFrequency())
                && ctx.averageSleepHours() != null;
        if (!medicalComplete || !lifestyleComplete) {
            return CalculatedMetric.insufficient(MetricType.HEALTH_RISK_SCORE,
                    List.of("medicalInformation", "lifestyle"));
        }

        double chronicRisk = Math.min(1.0, ctx.conditionCount() * 0.2 + ctx.severeAllergyCount() * 0.1);
        double familyRisk = Math.min(1.0, ctx.familyWithHereditaryCount() * 0.15);
        double lifestyleRisk = lifestyleRisk(ctx);
        double vitalsRisk = vitalsRisk(ctx, computed);
        double labRisk = labRisk(ctx);

        double risk = (chronicRisk * 0.25 + familyRisk * 0.15 + lifestyleRisk * 0.25
                + vitalsRisk * 0.20 + labRisk * 0.15) * 100.0;
        int score = (int) Math.round(risk);
        String label = riskLabel(score);
        ClassificationLevel level = riskLevel(score);

        return new CalculatedMetric(
                MetricType.HEALTH_RISK_SCORE,
                BigDecimal.valueOf(score),
                "score",
                level,
                "Your Health Risk Score is " + score + "/100 (" + label + ").",
                List.of(),
                score + "/100");
    }

    // --- Helpers ---

    private double bmrValue(String gender, double weightKg, double heightCm, int age) {
        double male = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        double female = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        if (isMale(gender)) {
            return male;
        }
        if (isFemale(gender)) {
            return female;
        }
        return (male + female) / 2.0;
    }

    private double idealWeightKg(String gender, double heightCm) {
        double heightInches = heightCm / 2.54;
        if (heightInches < 60) {
            heightInches = 60;
        }
        double base = isFemale(gender) ? 45.5 : 50.0;
        return base + 2.3 * (heightInches - 60);
    }

    private double proteinMultiplier(PatientProfileContext ctx) {
        double multiplier = switch (activityLevel(ctx.exerciseFrequency())) {
            case 1 -> 1.0;
            case 2 -> 1.2;
            case 3 -> 1.4;
            case 4 -> 1.6;
            default -> 0.8;
        };
        if (ctx.dateOfBirth() != null && ageYears(ctx.dateOfBirth()) >= 65) {
            multiplier = Math.max(multiplier, 1.0);
        }
        return multiplier;
    }

    private double waterActivityMultiplier(String exerciseFrequency) {
        return switch (activityLevel(exerciseFrequency)) {
            case 1 -> 1.0;
            case 2 -> 1.1;
            case 3 -> 1.2;
            case 4 -> 1.3;
            case 5 -> 1.4;
            default -> 1.0;
        };
    }

    private double activityFactor(String exerciseFrequency) {
        return switch (activityLevel(exerciseFrequency)) {
            case 1 -> 1.2;
            case 2 -> 1.375;
            case 3 -> 1.55;
            case 4 -> 1.725;
            case 5 -> 1.9;
            default -> 1.2;
        };
    }

    private int activityLevel(String exerciseFrequency) {
        if (!isPresent(exerciseFrequency)) {
            return 0;
        }
        String normalized = exerciseFrequency.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "SEDENTARY", "NONE" -> 1;
            case "LIGHT", "LIGHTLY_ACTIVE" -> 2;
            case "MODERATE", "MODERATELY_ACTIVE" -> 3;
            case "ACTIVE", "VERY_ACTIVE" -> 4;
            case "EXTREMELY_ACTIVE", "ATHLETE" -> 5;
            default -> 1;
        };
    }

    private double lifestyleScore(PatientProfileContext ctx) {
        double exercise = switch (activityLevel(ctx.exerciseFrequency())) {
            case 5 -> 1.0;
            case 4 -> 0.9;
            case 3 -> 0.75;
            case 2 -> 0.6;
            case 1 -> 0.4;
            default -> 0.5;
        };
        double sleep = 0.5;
        if (ctx.averageSleepHours() != null) {
            double hours = ctx.averageSleepHours().doubleValue();
            sleep = hours >= 7 && hours <= 9 ? 1.0 : hours >= 6 && hours <= 10 ? 0.7 : 0.4;
        }
        double smoking = switch (safeUpper(ctx.smokingStatus())) {
            case "NEVER", "NON_SMOKER" -> 1.0;
            case "FORMER" -> 0.3;
            case "CURRENT", "SMOKER" -> 0.0;
            default -> 0.5;
        };
        double alcohol = switch (safeUpper(ctx.alcoholConsumption())) {
            case "NEVER", "NONE" -> 1.0;
            case "OCCASIONAL", "SOCIAL" -> 0.7;
            case "REGULAR", "HEAVY" -> 0.4;
            default -> 0.7;
        };
        double stress = 0.5;
        if (ctx.stressLevel() != null) {
            stress = 1.0 - ((ctx.stressLevel() - 1) / 4.0);
        }
        return (exercise + sleep + smoking + alcohol + stress) / 5.0;
    }

    private double vitalsScore(PatientProfileContext ctx, Map<MetricType, CalculatedMetric> computed) {
        List<Double> scores = new ArrayList<>();
        if (ctx.latestVitals() != null && ctx.latestVitals().heartRate() != null) {
            int hr = ctx.latestVitals().heartRate();
            scores.add(hr >= 60 && hr <= 100 ? 1.0 : 0.5);
        }
        if (ctx.latestVitals() != null && ctx.latestVitals().spo2() != null) {
            scores.add(ctx.latestVitals().spo2() >= 95 ? 1.0 : 0.5);
        }
        CalculatedMetric glucose = computed.get(MetricType.BLOOD_SUGAR_CLASSIFICATION);
        if (glucose.classification() != ClassificationLevel.INSUFFICIENT_DATA) {
            scores.add(subScore(glucose));
        }
        return scores.isEmpty() ? 0.5 : scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.5);
    }

    private double goalsScore(PatientProfileContext ctx) {
        List<Double> progress = new ArrayList<>();
        if (ctx.targetWeightKg() != null && ctx.weightKg() != null) {
            double diff = Math.abs(ctx.weightKg().doubleValue() - ctx.targetWeightKg().doubleValue());
            progress.add(Math.max(0.0, 1.0 - diff / Math.max(ctx.weightKg().doubleValue(), 1.0)));
        }
        if (ctx.dailyStepsGoal() != null) {
            progress.add(1.0);
        }
        if (ctx.sleepHoursGoal() != null) {
            progress.add(1.0);
        }
        if (ctx.waterIntakeMlGoal() != null) {
            progress.add(1.0);
        }
        if (isPresent(ctx.exerciseFrequency())) {
            progress.add(activityLevel(ctx.exerciseFrequency()) >= 3 ? 1.0 : 0.5);
        }
        return progress.isEmpty() ? 0.5 : progress.stream().mapToDouble(Double::doubleValue).average().orElse(0.5);
    }

    private double lifestyleRisk(PatientProfileContext ctx) {
        double risk = 0.0;
        risk += switch (safeUpper(ctx.smokingStatus())) {
            case "CURRENT", "SMOKER" -> 0.8;
            case "FORMER" -> 0.3;
            default -> 0.0;
        };
        risk += switch (safeUpper(ctx.alcoholConsumption())) {
            case "REGULAR", "HEAVY" -> 0.5;
            default -> 0.0;
        };
        risk += activityLevel(ctx.exerciseFrequency()) <= 1 ? 0.7 : 0.0;
        if (ctx.stressLevel() != null && ctx.stressLevel() >= 4) {
            risk += 0.3;
        }
        return Math.min(1.0, risk);
    }

    private double vitalsRisk(PatientProfileContext ctx, Map<MetricType, CalculatedMetric> computed) {
        double risk = 0.0;
        CalculatedMetric bp = computed.get(MetricType.BP_CLASSIFICATION);
        if (bp.classification() == ClassificationLevel.CRITICAL) {
            risk += 0.8;
        } else if (bp.classification() == ClassificationLevel.WARNING) {
            risk += 0.4;
        }
        CalculatedMetric glucose = computed.get(MetricType.BLOOD_SUGAR_CLASSIFICATION);
        if (glucose.classification() == ClassificationLevel.CRITICAL) {
            risk += 0.7;
        }
        if (ctx.latestVitals() != null && ctx.latestVitals().heartRate() != null) {
            int hr = ctx.latestVitals().heartRate();
            if (hr < 60 || hr > 100) {
                risk += 0.3;
            }
        }
        return Math.min(1.0, risk);
    }

    private double labRisk(PatientProfileContext ctx) {
        if (ctx.latestLabs() == null) {
            return 0.0;
        }
        double risk = 0.0;
        if (ctx.latestLabs().hba1c() != null) {
            double hba1c = ctx.latestLabs().hba1c().doubleValue();
            if (hba1c >= 6.5) {
                risk += 0.6;
            } else if (hba1c >= 5.7) {
                risk += 0.3;
            }
        }
        if (ctx.latestLabs().ldl() != null) {
            double ldl = ctx.latestLabs().ldl().doubleValue();
            if (ldl >= 160) {
                risk += 0.5;
            } else if (ldl >= 130) {
                risk += 0.3;
            }
        }
        if (ctx.latestLabs().hdl() != null) {
            double hdl = ctx.latestLabs().hdl().doubleValue();
            double threshold = isMale(ctx.gender()) ? 40 : 50;
            if (hdl < threshold) {
                risk += 0.3;
            }
        }
        return Math.min(1.0, risk);
    }

    private ClassificationLevel glucoseLevel(double glucose, String readingType) {
        String type = readingType.toUpperCase(Locale.ROOT);
        if (glucose < 70) {
            return ClassificationLevel.CRITICAL;
        }
        return switch (type) {
            case "FASTING" -> {
                if (glucose < 100) {
                    yield ClassificationLevel.NORMAL;
                } else if (glucose <= 125) {
                    yield ClassificationLevel.WARNING;
                } else {
                    yield ClassificationLevel.CRITICAL;
                }
            }
            case "POST_PRANDIAL", "RANDOM" -> {
                if (glucose < 140) {
                    yield ClassificationLevel.NORMAL;
                } else if (glucose <= 199) {
                    yield ClassificationLevel.WARNING;
                } else {
                    yield ClassificationLevel.CRITICAL;
                }
            }
            default -> ClassificationLevel.INSUFFICIENT_DATA;
        };
    }

    private double subScore(CalculatedMetric metric) {
        return switch (metric.classification()) {
            case NORMAL -> 1.0;
            case WARNING -> 0.6;
            case CRITICAL -> 0.2;
            default -> 0.5;
        };
    }

    private double bpSubScore(CalculatedMetric metric) {
        return switch (metric.classification()) {
            case NORMAL -> 1.0;
            case WARNING -> 0.5;
            case CRITICAL -> 0.1;
            default -> 0.5;
        };
    }

    private ClassificationLevel mapStringClassification(String category) {
        return switch (category) {
            case "NORMAL" -> ClassificationLevel.NORMAL;
            case "WARNING" -> ClassificationLevel.WARNING;
            case "CRITICAL" -> ClassificationLevel.CRITICAL;
            default -> ClassificationLevel.INSUFFICIENT_DATA;
        };
    }

    private int zoneBpm(int resting, int hrr, double fraction) {
        return (int) Math.round((hrr * fraction) + resting);
    }

    private int ageYears(LocalDate dateOfBirth) {
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    private boolean isMale(String gender) {
        return "MALE".equalsIgnoreCase(gender);
    }

    private boolean isFemale(String gender) {
        return "FEMALE".equalsIgnoreCase(gender);
    }

    private boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }

    private String safeUpper(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private boolean hasAnyGoal(PatientProfileContext ctx) {
        return ctx.targetWeightKg() != null || ctx.dailyStepsGoal() != null
                || ctx.sleepHoursGoal() != null || ctx.waterIntakeMlGoal() != null;
    }

    private List<String> missingFields(BigDecimal first, String firstName, BigDecimal second, String secondName) {
        List<String> missing = new ArrayList<>();
        if (first == null) {
            missing.add(firstName);
        }
        if (second == null) {
            missing.add(secondName);
        }
        return missing;
    }

    private BigDecimal scale(double value, int places) {
        return BigDecimal.valueOf(value).setScale(places, RoundingMode.HALF_UP);
    }

    private ClassificationLevel profileCompletionLevel(int score) {
        if (score >= 80) {
            return ClassificationLevel.NORMAL;
        }
        if (score >= 60) {
            return ClassificationLevel.NORMAL;
        }
        if (score >= 40) {
            return ClassificationLevel.WARNING;
        }
        return ClassificationLevel.CRITICAL;
    }

    private String profileCompletionLabel(int score) {
        if (score >= 80) {
            return "Nearly Complete";
        }
        if (score >= 60) {
            return "Good Progress";
        }
        if (score >= 40) {
            return "Needs Attention";
        }
        return "Just Started";
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

    private ClassificationLevel wellnessLevel(int score) {
        if (score >= 60) {
            return ClassificationLevel.NORMAL;
        }
        if (score >= 40) {
            return ClassificationLevel.WARNING;
        }
        return ClassificationLevel.CRITICAL;
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

    private ClassificationLevel riskLevel(int score) {
        if (score <= 25) {
            return ClassificationLevel.NORMAL;
        }
        if (score <= 75) {
            return ClassificationLevel.WARNING;
        }
        return ClassificationLevel.CRITICAL;
    }
}
