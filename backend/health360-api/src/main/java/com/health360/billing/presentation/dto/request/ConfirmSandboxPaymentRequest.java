package com.health360.billing.presentation.dto.request;

import lombok.Data;

@Data
public class ConfirmSandboxPaymentRequest {

    /** Optional gateway payment id; generated if blank. */
    private String gatewayPaymentId;

    private String paymentMethod = "ONLINE";
}
