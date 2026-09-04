package com.health360.billing.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.billing.application.gateway.GatewayOrderRequest;
import com.health360.billing.application.gateway.GatewayOrderResult;
import com.health360.billing.application.gateway.PaymentGatewayClient;
import com.health360.billing.domain.InvoiceStatus;
import com.health360.billing.domain.PaymentGateway;
import com.health360.billing.domain.PaymentMethod;
import com.health360.billing.domain.PaymentStatus;
import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.billing.infrastructure.persistence.entity.PaymentEntity;
import com.health360.billing.infrastructure.persistence.repository.InvoiceRepository;
import com.health360.billing.infrastructure.persistence.repository.PaymentRepository;
import com.health360.billing.presentation.dto.request.ConfirmSandboxPaymentRequest;
import com.health360.billing.presentation.dto.request.CreatePaymentIntentRequest;
import com.health360.billing.presentation.dto.response.PaymentIntentResponse;
import com.health360.billing.presentation.dto.response.PaymentResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnlinePaymentService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final BillingAccessService accessService;
    private final BillingMapper mapper;
    private final PaymentGatewayClient paymentGatewayClient;
    private final AuditLogService auditLogService;
    private final FeatureAccessService featureAccessService;
    private final ObjectMapper objectMapper;
    private final SaasBillingService saasBillingService;

    @Transactional
    public PaymentIntentResponse createInvoicePaymentIntent(
            UserPrincipal principal, UUID invoiceId, CreatePaymentIntentRequest request) {
        InvoiceEntity invoice = requireInvoice(principal.getTenantId(), invoiceId);
        accessService.assertCanReadInvoice(principal, invoice);
        featureAccessService.assertHasFeature(
                invoice.getHospitalId(),
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_BILLING,
                "Billing is not available on this hospital's current plan.");

        assertInvoicePayable(invoice);

        BigDecimal outstanding = invoice.getTotalAmount().subtract(invoice.getAmountPaid())
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal amount = request.getAmount() != null
                ? request.getAmount().setScale(2, RoundingMode.HALF_UP)
                : outstanding;
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Nothing to pay");
        }
        if (amount.compareTo(outstanding) > 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Payment amount exceeds outstanding balance");
        }

        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            var existing = paymentRepository.findByTenantIdAndIdempotencyKeyAndDeletedAtIsNull(
                    principal.getTenantId(), request.getIdempotencyKey().trim());
            if (existing.isPresent()) {
                return toIntentResponse(existing.get(), invoice);
            }
        }

        var pendingReuse = paymentRepository
                .findFirstByInvoiceIdAndStatusAndGatewayAndDeletedAtIsNullOrderByCreatedAtDesc(
                        invoice.getId(), PaymentStatus.PENDING.name(), PaymentGateway.RAZORPAY.name());
        if (pendingReuse.isPresent()
                && pendingReuse.get().getAmount().compareTo(amount) == 0
                && pendingReuse.get().getGatewayOrderId() != null) {
            return toIntentResponse(pendingReuse.get(), invoice);
        }

        GatewayOrderResult order = paymentGatewayClient.createOrder(new GatewayOrderRequest(
                "inv_" + invoice.getId().toString().replace("-", "").substring(0, 20),
                amount,
                invoice.getCurrency(),
                invoice.getInvoiceNumber()));

        PaymentEntity payment = new PaymentEntity();
        payment.setTenantId(principal.getTenantId());
        payment.setInvoiceId(invoice.getId());
        payment.setAmount(amount);
        payment.setCurrency(invoice.getCurrency());
        payment.setStatus(PaymentStatus.PENDING.name());
        payment.setGateway(PaymentGateway.RAZORPAY.name());
        payment.setGatewayOrderId(order.orderId());
        payment.setPaymentMethod(PaymentMethod.ONLINE.name());
        payment.setIdempotencyKey(request.getIdempotencyKey() != null ? request.getIdempotencyKey().trim() : null);
        payment.setCreatedBy(principal.getUserId());
        payment.setUpdatedBy(principal.getUserId());
        payment = paymentRepository.saveAndFlush(payment);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PAYMENT_INTENT_CREATED",
                "billing.payment", payment.getId(),
                Map.of("invoiceId", invoice.getId(), "orderId", order.orderId(), "amount", amount));

        return toIntentResponse(payment, invoice);
    }

    @Transactional
    public PaymentResponse confirmSandboxPayment(
            UserPrincipal principal, UUID paymentId, ConfirmSandboxPaymentRequest request) {
        if (!paymentGatewayClient.isSandboxMode()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Sandbox confirmation is only available in sandbox mode");
        }

        PaymentEntity payment = paymentRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(paymentId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Payment not found"));

        if (payment.getInvoiceId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Not an invoice payment");
        }

        InvoiceEntity invoice = requireInvoice(principal.getTenantId(), payment.getInvoiceId());
        accessService.assertCanReadInvoice(principal, invoice);

        if (!PaymentStatus.PENDING.name().equals(payment.getStatus())) {
            return mapper.toPaymentResponse(payment);
        }

        String gatewayPaymentId = request.getGatewayPaymentId() != null && !request.getGatewayPaymentId().isBlank()
                ? request.getGatewayPaymentId().trim()
                : "pay_sandbox_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        captureInvoicePayment(payment, gatewayPaymentId, parseMethod(request.getPaymentMethod()), principal.getUserId());
        return mapper.toPaymentResponse(payment);
    }

    @Transactional
    public void handleWebhook(String rawBody, String signature) {
        if (!paymentGatewayClient.verifyWebhookSignature(rawBody, signature)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED,
                    "Invalid webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String event = root.path("event").asText("");
            if (!"payment.captured".equals(event) && !"order.paid".equals(event)) {
                log.info("Ignoring Razorpay webhook event={}", event);
                return;
            }

            JsonNode paymentNode = root.path("payload").path("payment").path("entity");
            if (paymentNode.isMissingNode() || paymentNode.isNull()) {
                paymentNode = root.path("payload").path("order").path("entity");
            }

            String orderId = paymentNode.path("order_id").asText(null);
            if (orderId == null || orderId.isBlank()) {
                orderId = paymentNode.path("id").asText(null);
            }
            String gatewayPaymentId = paymentNode.path("id").asText(null);
            if ("order.paid".equals(event) && gatewayPaymentId != null && gatewayPaymentId.startsWith("order_")) {
                gatewayPaymentId = "pay_" + gatewayPaymentId.substring(6);
            }
            String method = paymentNode.path("method").asText("ONLINE");

            if (orderId == null || orderId.isBlank()) {
                log.warn("Webhook missing order id");
                return;
            }

            if (saasBillingService.tryCaptureByOrderId(orderId, gatewayPaymentId, method)) {
                return;
            }

            var paymentOpt = paymentRepository.findByGatewayAndGatewayOrderIdAndDeletedAtIsNull(
                    PaymentGateway.RAZORPAY.name(), orderId);
            if (paymentOpt.isEmpty()) {
                log.warn("No payment found for Razorpay order {}", orderId);
                return;
            }

            PaymentEntity payment = paymentOpt.get();
            if (PaymentStatus.CAPTURED.name().equals(payment.getStatus())) {
                return;
            }
            if (gatewayPaymentId != null) {
                var byPayId = paymentRepository.findByGatewayAndGatewayPaymentIdAndDeletedAtIsNull(
                        PaymentGateway.RAZORPAY.name(), gatewayPaymentId);
                if (byPayId.isPresent() && !byPayId.get().getId().equals(payment.getId())) {
                    log.warn("Duplicate gateway payment id {}", gatewayPaymentId);
                    return;
                }
            }

            captureInvoicePayment(
                    payment,
                    gatewayPaymentId != null ? gatewayPaymentId : "pay_webhook_" + orderId,
                    mapRazorpayMethod(method),
                    null);
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to process Razorpay webhook", ex);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Webhook processing failed");
        }
    }

    private void captureInvoicePayment(
            PaymentEntity payment, String gatewayPaymentId, PaymentMethod method, UUID actorId) {
        InvoiceEntity invoice = requireInvoice(payment.getTenantId(), payment.getInvoiceId());
        assertInvoicePayable(invoice);

        BigDecimal outstanding = invoice.getTotalAmount().subtract(invoice.getAmountPaid())
                .setScale(2, RoundingMode.HALF_UP);
        if (payment.getAmount().compareTo(outstanding) > 0) {
            payment.setStatus(PaymentStatus.FAILED.name());
            payment.setNotes("Amount exceeds outstanding at capture time");
            payment.touch();
            paymentRepository.save(payment);
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Payment amount exceeds outstanding balance");
        }

        payment.setStatus(PaymentStatus.CAPTURED.name());
        payment.setGatewayPaymentId(gatewayPaymentId);
        payment.setPaymentMethod(method.name());
        payment.setPaidAt(Instant.now());
        payment.setUpdatedBy(actorId);
        payment.touch();
        paymentRepository.save(payment);

        BigDecimal newPaid = invoice.getAmountPaid().add(payment.getAmount()).setScale(2, RoundingMode.HALF_UP);
        invoice.setAmountPaid(newPaid);
        if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID.name());
            invoice.setPaidAt(Instant.now());
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID.name());
        }
        invoice.setUpdatedBy(actorId);
        invoice.touch();
        invoiceRepository.save(invoice);

        auditLogService.record(payment.getTenantId(), actorId, "PAYMENT_CAPTURED",
                "billing.payment", payment.getId(),
                Map.of("invoiceId", invoice.getId(), "gatewayPaymentId", gatewayPaymentId));
    }

    private PaymentIntentResponse toIntentResponse(PaymentEntity payment, InvoiceEntity invoice) {
        return PaymentIntentResponse.builder()
                .paymentId(payment.getId())
                .invoiceId(invoice.getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .gateway(payment.getGateway())
                .gatewayOrderId(payment.getGatewayOrderId())
                .razorpayKeyId(paymentGatewayClient.getPublicKeyId())
                .sandbox(paymentGatewayClient.isSandboxMode())
                .description(invoice.getInvoiceNumber())
                .build();
    }

    private void assertInvoicePayable(InvoiceEntity invoice) {
        if (InvoiceStatus.PAID.name().equals(invoice.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invoice is already paid");
        }
        if (InvoiceStatus.CANCELLED.name().equals(invoice.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invoice is cancelled");
        }
    }

    private InvoiceEntity requireInvoice(UUID tenantId, UUID invoiceId) {
        return invoiceRepository.findByIdAndTenantIdAndDeletedAtIsNull(invoiceId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Invoice not found"));
    }

    private PaymentMethod parseMethod(String method) {
        try {
            return PaymentMethod.valueOf(method.toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            return PaymentMethod.ONLINE;
        }
    }

    private PaymentMethod mapRazorpayMethod(String method) {
        if (method == null) {
            return PaymentMethod.ONLINE;
        }
        return switch (method.toLowerCase(Locale.ROOT)) {
            case "card" -> PaymentMethod.CARD;
            case "upi" -> PaymentMethod.UPI;
            case "netbanking", "wallet", "emi" -> PaymentMethod.ONLINE;
            default -> PaymentMethod.ONLINE;
        };
    }
}
