package com.health360.billing.application.service;

import com.health360.billing.domain.InvoiceLineSourceType;
import com.health360.billing.domain.InvoiceStatus;
import com.health360.billing.domain.PaymentGateway;
import com.health360.billing.domain.PaymentMethod;
import com.health360.billing.domain.PaymentStatus;
import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.billing.infrastructure.persistence.entity.InvoiceLineItemEntity;
import com.health360.billing.infrastructure.persistence.entity.PaymentEntity;
import com.health360.billing.infrastructure.persistence.repository.InvoiceLineItemRepository;
import com.health360.billing.infrastructure.persistence.repository.InvoiceRepository;
import com.health360.billing.infrastructure.persistence.repository.PaymentRepository;
import com.health360.billing.presentation.dto.request.CreateInvoiceLineItemRequest;
import com.health360.billing.presentation.dto.request.CreateInvoiceRequest;
import com.health360.billing.presentation.dto.request.RecordPaymentRequest;
import com.health360.billing.presentation.dto.response.InvoiceResponse;
import com.health360.billing.presentation.dto.response.PaymentResponse;
import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineItemRepository lineItemRepository;
    private final PaymentRepository paymentRepository;
    private final EncounterRepository encounterRepository;
    private final InvoiceNumberService invoiceNumberService;
    private final BillingAccessService accessService;
    private final HospitalScopeService hospitalScopeService;
    private final EncounterAccessService encounterAccessService;
    private final BillingMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public InvoiceResponse createInvoice(UserPrincipal principal, CreateInvoiceRequest request) {
        accessService.assertCanWriteInvoices(principal);
        UUID tenantId = principal.getTenantId();

        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getEncounterId(), tenantId)
                .orElseThrow(() -> notFound("Encounter not found"));

        hospitalScopeService.assertHospitalScope(
                principal, encounter.getHospitalId(), encounter.getBranchId());

        if (invoiceRepository.existsByTenantIdAndEncounterIdAndDeletedAtIsNullAndStatusNot(
                tenantId, encounter.getId(), InvoiceStatus.CANCELLED.name())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Active invoice already exists for this encounter");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateInvoiceLineItemRequest line : request.getLineItems()) {
            subtotal = subtotal.add(line.getQuantity().multiply(line.getUnitPrice()));
        }
        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        BigDecimal taxAmount = request.getTaxAmount() != null
                ? request.getTaxAmount().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP);

        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setTenantId(tenantId);
        invoice.setInvoiceNumber(invoiceNumberService.allocateInvoiceNumber(tenantId, encounter.getHospitalId()));
        invoice.setEncounterId(encounter.getId());
        invoice.setPatientId(encounter.getPatientId());
        invoice.setHospitalId(encounter.getHospitalId());
        invoice.setBranchId(encounter.getBranchId());
        invoice.setStatus(InvoiceStatus.ISSUED.name());
        invoice.setSubtotalAmount(subtotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setNotes(request.getNotes());
        invoice.setCreatedBy(principal.getUserId());
        invoice.setUpdatedBy(principal.getUserId());
        invoiceRepository.save(invoice);

        for (CreateInvoiceLineItemRequest lineRequest : request.getLineItems()) {
            InvoiceLineItemEntity lineItem = new InvoiceLineItemEntity();
            lineItem.setTenantId(tenantId);
            lineItem.setInvoiceId(invoice.getId());
            lineItem.setDescription(lineRequest.getDescription());
            lineItem.setQuantity(lineRequest.getQuantity().setScale(2, RoundingMode.HALF_UP));
            lineItem.setUnitPrice(lineRequest.getUnitPrice().setScale(2, RoundingMode.HALF_UP));
            lineItem.setLineTotal(lineRequest.getQuantity()
                    .multiply(lineRequest.getUnitPrice())
                    .setScale(2, RoundingMode.HALF_UP));
            lineItem.setSourceType(resolveSourceType(lineRequest.getSourceType()));
            lineItem.setSourceId(lineRequest.getSourceId());
            lineItem.setCreatedBy(principal.getUserId());
            lineItem.setUpdatedBy(principal.getUserId());
            lineItemRepository.save(lineItem);
        }

        auditLogService.record(tenantId, principal.getUserId(), "INVOICE_CREATED",
                "billing.invoice", invoice.getId(), Map.of("invoiceNumber", invoice.getInvoiceNumber()));

        return loadInvoiceResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByEncounter(UserPrincipal principal, UUID encounterId) {
        accessService.assertCanReadInvoices(principal);
        UUID tenantId = principal.getTenantId();

        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> notFound("Encounter not found"));
        hospitalScopeService.assertHospitalScope(
                principal, encounter.getHospitalId(), encounter.getBranchId());

        InvoiceEntity invoice = invoiceRepository
                .findFirstByTenantIdAndEncounterIdAndDeletedAtIsNullAndStatusNotOrderByIssuedAtDesc(
                        tenantId, encounterId, InvoiceStatus.CANCELLED.name())
                .orElseThrow(() -> notFound("Invoice not found for encounter"));

        return loadInvoiceResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(UserPrincipal principal, UUID invoiceId) {
        InvoiceEntity invoice = requireInvoice(principal.getTenantId(), invoiceId);
        accessService.assertCanReadInvoice(principal, invoice);
        return loadInvoiceResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> listHospitalInvoices(
            UserPrincipal principal, UUID hospitalId, UUID branchId, Pageable pageable) {
        accessService.assertCanReadInvoices(principal);
        hospitalScopeService.assertHospitalScope(principal, hospitalId, branchId);

        return invoiceRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByIssuedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable)
                .map(this::loadInvoiceResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> listMyInvoices(UserPrincipal principal, Pageable pageable) {
        accessService.assertCanReadInvoices(principal);
        UUID patientProfileId = encounterAccessService.resolvePatientProfileIdForUser(
                principal.getUserId(), principal.getTenantId());
        if (patientProfileId == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Patient profile not found");
        }

        return invoiceRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByIssuedAtDesc(
                        principal.getTenantId(), patientProfileId, pageable)
                .map(this::loadInvoiceResponse);
    }

    @Transactional
    public PaymentResponse recordPayment(UserPrincipal principal, UUID invoiceId, RecordPaymentRequest request) {
        accessService.assertCanWritePayments(principal);
        InvoiceEntity invoice = requireInvoice(principal.getTenantId(), invoiceId);
        accessService.assertCanWriteInvoice(principal, invoice);

        if (InvoiceStatus.PAID.name().equals(invoice.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invoice is already paid");
        }
        if (InvoiceStatus.CANCELLED.name().equals(invoice.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invoice is cancelled");
        }

        PaymentMethod paymentMethod = parsePaymentMethod(request.getPaymentMethod());
        BigDecimal amount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal outstanding = invoice.getTotalAmount().subtract(invoice.getAmountPaid());
        if (amount.compareTo(outstanding) > 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Payment amount exceeds outstanding balance");
        }

        PaymentEntity payment = new PaymentEntity();
        payment.setTenantId(principal.getTenantId());
        payment.setInvoiceId(invoice.getId());
        payment.setAmount(amount);
        payment.setStatus(PaymentStatus.CAPTURED.name());
        payment.setGateway(PaymentGateway.MANUAL.name());
        payment.setPaymentMethod(paymentMethod.name());
        payment.setNotes(request.getNotes());
        payment.setCreatedBy(principal.getUserId());
        payment.setUpdatedBy(principal.getUserId());
        paymentRepository.save(payment);

        BigDecimal newPaid = invoice.getAmountPaid().add(amount).setScale(2, RoundingMode.HALF_UP);
        invoice.setAmountPaid(newPaid);
        if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID.name());
            invoice.setPaidAt(Instant.now());
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID.name());
        }
        invoice.setUpdatedBy(principal.getUserId());
        invoice.touch();
        invoiceRepository.save(invoice);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PAYMENT_RECORDED",
                "billing.payment", payment.getId(), Map.of("invoiceId", invoice.getId(), "amount", amount));

        return mapper.toPaymentResponse(payment);
    }

    private InvoiceResponse loadInvoiceResponse(InvoiceEntity invoice) {
        List<InvoiceLineItemEntity> lines = lineItemRepository
                .findByInvoiceIdAndDeletedAtIsNullOrderByCreatedAtAsc(invoice.getId());
        return mapper.toInvoiceResponse(invoice, lines);
    }

    private InvoiceEntity requireInvoice(UUID tenantId, UUID invoiceId) {
        return invoiceRepository.findByIdAndTenantIdAndDeletedAtIsNull(invoiceId, tenantId)
                .orElseThrow(() -> notFound("Invoice not found"));
    }

    private String resolveSourceType(String sourceType) {
        if (sourceType == null || sourceType.isBlank()) {
            return InvoiceLineSourceType.MANUAL.name();
        }
        try {
            return InvoiceLineSourceType.valueOf(sourceType.toUpperCase()).name();
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid source type");
        }
    }

    private PaymentMethod parsePaymentMethod(String method) {
        try {
            return PaymentMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid payment method");
        }
    }

    private BusinessException notFound(String message) {
        return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }
}
