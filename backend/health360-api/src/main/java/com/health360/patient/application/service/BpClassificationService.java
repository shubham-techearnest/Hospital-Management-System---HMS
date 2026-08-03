package com.health360.patient.application.service;

import org.springframework.stereotype.Component;

@Component
public class BpClassificationService {

    public record BpClassification(String category, String interpretation) {}

    public BpClassification classify(Integer systolic, Integer diastolic) {
        if (systolic == null || diastolic == null) {
            return null;
        }
        if (systolic <= diastolic) {
            return new BpClassification("INVALID", "Systolic must be greater than diastolic.");
        }

        String category;
        if (systolic > 180 || diastolic > 120) {
            category = "CRITICAL";
        } else if (systolic >= 140 || diastolic >= 90) {
            category = "CRITICAL";
        } else if (systolic >= 130 || diastolic >= 80) {
            category = "WARNING";
        } else if (systolic >= 120 && diastolic < 80) {
            category = "WARNING";
        } else {
            category = "NORMAL";
        }

        String interpretation = switch (category) {
            case "NORMAL" -> String.format(
                    "Your blood pressure %d/%d mmHg is within the normal range.", systolic, diastolic);
            case "WARNING" -> String.format(
                    "Your blood pressure %d/%d mmHg is elevated. Monitor regularly and consult your doctor.",
                    systolic, diastolic);
            default -> String.format(
                    "Your blood pressure %d/%d mmHg is high. Please consult a healthcare professional promptly.",
                    systolic, diastolic);
        };

        return new BpClassification(category, interpretation);
    }
}
