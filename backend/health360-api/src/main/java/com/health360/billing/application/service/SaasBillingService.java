package com.health360.billing.application.service;

import com.health360.billing.application.gateway.GatewayOrderRequest;
import com.health360.billing.application.gateway.GatewayOrderResult;
import com.health360.billing.application.gateway.PaymentGatewayClient;
import com.health360.billing.domain.PaymentGateway;
import com.health360.billing.domain.PaymentStatus;
import com.health360.billing.infrastructure.persistence.entity.SaasInvoiceEntity;
import com.health360.billing.infrastructure.persistence.entity.SaasInvoiceNumberSequenceEntity;
import com.health360.billing.infrastructure.persistence.repository.SaasInvoiceNumberSequenceRepository;
import com.health360.billing.infrastructure.persistence.repository.SaasInvoiceRepository;
import com.health360.billing.presentation.dto.response.SaasPaymentIntentResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalService;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.application.service.HospitalSubscriptionService;
import com.health360.subscription.domain.SubscriptionHistoryEventType;
import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SaasBillingService {

    private final SaasInvoiceRepository saasInvoiceRepository;
    private final SaasInvoiceNumberSequenceRepository sequenceRepository;
    private final PaymentGatewayClient paymentGatewayClient;
    private final HospitalSubscriptionService hospitalSubscriptionService;
    private final HospitalService hospitalService;
    private final AuditLogService auditLogService;

    @Transactional
    public SaasPaymentIntentResponse createRenewalIntentForHospitalAdmin(UserPrincipal principal) {
        var profile = hospitalService.getProfile(principal.getUserId(), principal.getTenantId());
        return createRenewalIntent(principal.getTenantId(), principal.getUserId(), profile.getId());
    }

    @Transactional
    public SaasPaymentIntentResponse createRenewalIntentForAdmin(
            UserPrincipal principal, UUID hospitalId) {
        return createRenewalIntent(principal.getTenantId(), principal.getUserId(), hospitalId);
    }

    @Transactional
    public SaasPaymentIntentResponse createRenewalIntent(UUID tenantId, UUID actorId, UUID hospitalId) {
        HospitalSubscriptionEntity subscription =
                hospitalSubscriptionService.requireActiveSubscription(hospitalId, tenantId);
        SubscriptionPlanEntity plan =
                hospitalSubscriptionService.requirePlan(subscription.getPlanId(), tenantId);

        BigDecimal amount = plan.getPrice() != null
                ? plan.getPrice().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Current plan has no payable amount");
        }

        var pending = saasInvoiceRepository
                .findFirstByHospitalIdAndTenantIdAndPaymentStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        hospitalId, tenantId, PaymentStatus.PENDING.name());
        if (pending.isPresent()
                && pending.get().getAmount().compareTo(amount) == 0
                && pending.get().getGatewayOrderId() != null
                && "ISSUED".equals(pending.get().getStatus())) {
            return toResponse(pending.get());
        }

        LocalDate periodStart = subscription.getEndDate() != null && !subscription.getEndDate().isBefore(LocalDate.now())
                ? subscription.getEndDate().plusDays(1)
                : LocalDate.now();
        LocalDate periodEnd = advancePeriod(periodStart, plan.getBillingCycle());

        GatewayOrderResult order = paymentGatewayClient.createOrder(new GatewayOrderRequest(
                "saas_" + hospitalId.toString().replace("-", "").substring(0, 16),
                amount,
                plan.getCurrency(),
                plan.getCode() + " renewal"));

        SaasInvoiceEntity invoice = new SaasInvoiceEntity();
        invoice.setTenantId(tenantId);
        invoice.setHospitalId(hospitalId);
        invoice.setPlanId(plan.getId());
        invoice.setSubscriptionId(subscription.getId());
        invoice.setInvoiceNumber(allocateInvoiceNumber(hospitalId));
        invoice.setAmount(amount);
        invoice.setCurrency(plan.getCurrency());
        invoice.setStatus("ISSUED");
        invoice.setBillingPeriodStart(periodStart);
        invoice.setBillingPeriodEnd(periodEnd);
        invoice.setGateway(PaymentGateway.RAZORPAY.name());
        invoice.setGatewayOrderId(order.orderId());
        invoice.setPaymentStatus(PaymentStatus.PENDING.name());
        invoice.setCreatedBy(actorId);
        invoice.setUpdatedBy(actorId);
        invoice = saasInvoiceRepository.saveAndFlush(invoice);

        auditLogService.record(tenantId, actorId, "SAAS_PAYMENT_INTENT_CREATED",
                "billing.saas_invoice", invoice.getId(),
                Map.of("hospitalId", hospitalId, "orderId", order.orderId(), "amount", amount));

        return toResponse(invoice);
    }

    @Transactional
    public SaasPaymentIntentResponse confirmSandboxForHospitalAdmin(UserPrincipal principal, UUID saasInvoiceId) {
        if (!paymentGatewayClient.isSandboxMode()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Sandbox confirmation is only available in sandbox mode");
        }
        SaasInvoiceEntity invoice = requireSaasInvoice(principal.getTenantId(), saasInvoiceId);
        var profile = hospitalService.getProfile(principal.getUserId(), principal.getTenantId());
        if (!profile.getId().equals(invoice.getHospitalId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        return confirmSandboxInternal(invoice, principal.getUserId());
    }

    @Transactional
    public SaasPaymentIntentResponse confirmSandboxForPlatformAdmin(UserPrincipal principal, UUID saasInvoiceId) {
        if (!paymentGatewayClient.isSandboxMode()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Sandbox confirmation is only available in sandbox mode");
        }
        SaasInvoiceEntity invoice = requireSaasInvoice(principal.getTenantId(), saasInvoiceId);
        return confirmSandboxInternal(invoice, principal.getUserId());
    }

    private SaasPaymentIntentResponse confirmSandboxInternal(SaasInvoiceEntity invoice, UUID actorId) {
        if (!PaymentStatus.PENDING.name().equals(invoice.getPaymentStatus())) {
            return toResponse(invoice);
        }
        captureSaasInvoice(
                invoice,
                "pay_sandbox_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14),
                actorId);
        return toResponse(invoice);
    }

    private SaasInvoiceEntity requireSaasInvoice(UUID tenantId, UUID saasInvoiceId) {
        return saasInvoiceRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(saasInvoiceId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "SaaS invoice not found"));
    }

    /**
     * @return true if this order belonged to a SaaS invoice and was handled
     */
    @Transactional
    public boolean tryCaptureByOrderId(String orderId, String gatewayPaymentId, String method) {
        var opt = saasInvoiceRepository.findByGatewayAndGatewayOrderIdAndDeletedAtIsNull(
                PaymentGateway.RAZORPAY.name(), orderId);
        if (opt.isEmpty()) {
            return false;
        }
        SaasInvoiceEntity invoice = opt.get();
        if (PaymentStatus.CAPTURED.name().equals(invoice.getPaymentStatus())) {
            return true;
        }
        String payId = gatewayPaymentId != null && !gatewayPaymentId.isBlank()
                ? gatewayPaymentId
                : "pay_webhook_" + orderId;
        captureSaasInvoice(invoice, payId, null);
        log.info("Captured SaaS invoice {} via webhook method={}", invoice.getId(), method);
        return true;
    }

    private void captureSaasInvoice(SaasInvoiceEntity invoice, String gatewayPaymentId, UUID actorId) {
        if (gatewayPaymentId != null) {
            var dup = saasInvoiceRepository.findByGatewayAndGatewayPaymentIdAndDeletedAtIsNull(
                    PaymentGateway.RAZORPAY.name(), gatewayPaymentId);
            if (dup.isPresent() && !dup.get().getId().equals(invoice.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                        "Gateway payment already applied");
            }
        }

        invoice.setPaymentStatus(PaymentStatus.CAPTURED.name());
        invoice.setStatus("PAID");
        invoice.setGatewayPaymentId(gatewayPaymentId);
        invoice.setPaidAt(Instant.now());
        invoice.setUpdatedBy(actorId);
        invoice.touch();
        saasInvoiceRepository.save(invoice);

        hospitalSubscriptionService.renewAfterPayment(
                invoice.getHospitalId(),
                invoice.getTenantId(),
                invoice.getBillingPeriodEnd(),
                actorId,
                "Paid SaaS invoice " + invoice.getInvoiceNumber());

        auditLogService.record(invoice.getTenantId(), actorId, "SAAS_PAYMENT_CAPTURED",
                "billing.saas_invoice", invoice.getId(),
                Map.of("hospitalId", invoice.getHospitalId(), "gatewayPaymentId", gatewayPaymentId));
    }

    private String allocateInvoiceNumber(UUID hospitalId) {
        int year = LocalDate.now(ZoneId.systemDefault()).getYear();
        SaasInvoiceNumberSequenceEntity sequence = sequenceRepository.findForUpdate(hospitalId, year)
                .orElseGet(() -> {
                    try {
                        SaasInvoiceNumberSequenceEntity created = new SaasInvoiceNumberSequenceEntity();
                        created.setHospitalId(hospitalId);
                        created.setYear(year);
                        created.setLastValue(0L);
                        return sequenceRepository.saveAndFlush(created);
                    } catch (DataIntegrityViolationException ex) {
                        return sequenceRepository.findForUpdate(hospitalId, year).orElseThrow(() -> ex);
                    }
                });
        long next = sequence.getLastValue() + 1;
        sequence.setLastValue(next);
        sequenceRepository.save(sequence);
        return "SAAS-" + year + "-" + String.format("%06d", next);
    }

    private LocalDate advancePeriod(LocalDate start, String billingCycle) {
        String cycle = billingCycle != null ? billingCycle.toUpperCase(Locale.ROOT) : "MONTHLY";
        return switch (cycle) {
            case "YEARLY", "ANNUAL" -> start.plusYears(1).minusDays(1);
            case "QUARTERLY" -> start.plusMonths(3).minusDays(1);
            case "NONE" -> start.plusMonths(1).minusDays(1);
            default -> start.plusMonths(1).minusDays(1);
        };
    }

    private SaasPaymentIntentResponse toResponse(SaasInvoiceEntity invoice) {
        return SaasPaymentIntentResponse.builder()
                .saasInvoiceId(invoice.getId())
                .hospitalId(invoice.getHospitalId())
                .planId(invoice.getPlanId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .amount(invoice.getAmount())
                .currency(invoice.getCurrency())
                .status(invoice.getStatus())
                .paymentStatus(invoice.getPaymentStatus())
                .gatewayOrderId(invoice.getGatewayOrderId())
                .razorpayKeyId(paymentGatewayClient.getPublicKeyId())
                .sandbox(paymentGatewayClient.isSandboxMode())
                .billingPeriodStart(invoice.getBillingPeriodStart())
                .billingPeriodEnd(invoice.getBillingPeriodEnd())
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
