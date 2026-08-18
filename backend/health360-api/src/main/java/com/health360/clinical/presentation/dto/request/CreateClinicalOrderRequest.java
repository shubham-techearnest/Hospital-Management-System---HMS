package com.health360.clinical.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateClinicalOrderRequest {

    @NotBlank
    @Size(max = 20)
    private String orderType;

    @Size(max = 2000)
    private String instructions;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    @Getter
    @Setter
    public static class OrderItemRequest {

        @Size(max = 100)
        private String itemCode;

        @NotBlank
        @Size(max = 300)
        private String itemName;

        private java.util.UUID itemReferenceId;

        private Integer quantity;

        @Size(max = 1000)
        private String instructions;
    }
}
