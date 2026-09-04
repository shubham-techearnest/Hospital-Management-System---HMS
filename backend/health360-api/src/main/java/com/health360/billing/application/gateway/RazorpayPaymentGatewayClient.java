package com.health360.billing.application.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.config.Health360Properties;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class RazorpayPaymentGatewayClient implements PaymentGatewayClient {

    private final Health360Properties properties;
    private final ObjectMapper objectMapper;

    @Override
    public GatewayOrderResult createOrder(GatewayOrderRequest request) {
        long amountPaise = toPaise(request.amount());
        String currency = request.currency() != null ? request.currency() : "INR";

        if (useMockOrders()) {
            String orderId = "order_sandbox_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            return new GatewayOrderResult(orderId, amountPaise, currency, "created", true);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", amountPaise);
        body.put("currency", currency);
        body.put("receipt", truncate(request.receipt(), 40));
        body.put("payment_capture", 1);
        if (request.notes() != null && !request.notes().isBlank()) {
            body.put("notes", Map.of("description", truncate(request.notes(), 200)));
        }

        try {
            RestClient client = RestClient.builder()
                    .baseUrl(razorpay().getApiBaseUrl())
                    .defaultHeaders(headers -> headers.setBasicAuth(
                            razorpay().getKeyId(), razorpay().getKeySecret()))
                    .build();

            String response = client.post()
                    .uri("/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode node = objectMapper.readTree(response);
            return new GatewayOrderResult(
                    node.path("id").asText(),
                    node.path("amount").asLong(amountPaise),
                    node.path("currency").asText(currency),
                    node.path("status").asText("created"),
                    isSandboxMode());
        } catch (RestClientResponseException ex) {
            log.error("Razorpay create order failed: {}", ex.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.EXTERNAL_SERVICE_ERROR, HttpStatus.BAD_GATEWAY,
                    "Payment gateway rejected the order");
        } catch (Exception ex) {
            log.error("Razorpay create order error", ex);
            throw new BusinessException(ErrorCode.EXTERNAL_SERVICE_ERROR, HttpStatus.BAD_GATEWAY,
                    "Unable to create payment order");
        }
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        String secret = razorpay().getWebhookSecret();
        if (secret == null || secret.isBlank()) {
            if (isSandboxMode()) {
                log.warn("Razorpay webhook secret blank — accepting signature in sandbox mode");
                return true;
            }
            return false;
        }
        if (signature == null || signature.isBlank()) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(digest);
            return constantTimeEquals(expected, signature);
        } catch (Exception ex) {
            log.error("Webhook signature verification failed", ex);
            return false;
        }
    }

    @Override
    public String getPublicKeyId() {
        String keyId = razorpay().getKeyId();
        return keyId != null ? keyId : "";
    }

    @Override
    public boolean isSandboxMode() {
        return !"live".equalsIgnoreCase(razorpay().getMode());
    }

    private boolean useMockOrders() {
        String keyId = razorpay().getKeyId();
        String keySecret = razorpay().getKeySecret();
        return isSandboxMode() && (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank());
    }

    private Health360Properties.Razorpay razorpay() {
        return properties.getPayments().getRazorpay();
    }

    static long toPaise(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        return value.length() <= max ? value : value.substring(0, max);
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
