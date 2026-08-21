package com.health360.clinical.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreatePrescriptionRequest {

    @Size(max = 2000)
    private String notes;

    @NotEmpty
    @Valid
    private List<PrescriptionItemRequest> items;

    @Getter
    @Setter
    public static class PrescriptionItemRequest {
        private UUID medicineId;

        @Size(max = 30)
        private String medicineCode;

        @Size(max = 300)
        private String medicineName;

        @Size(max = 100)
        private String doseText;

        @Size(max = 30)
        private String route;

        @Size(max = 100)
        private String frequency;

        private Integer durationDays;

        private Integer quantity;

        @Size(max = 2000)
        private String instructions;

        @Size(max = 500)
        private String safetyWarning;
    }
}
