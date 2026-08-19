package com.health360.billing.application.service;

import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.billing.infrastructure.persistence.entity.InvoiceLineItemEntity;
import com.health360.billing.infrastructure.persistence.entity.PaymentEntity;
import com.health360.billing.presentation.dto.response.InvoiceLineItemResponse;
import com.health360.billing.presentation.dto.response.InvoiceResponse;
import com.health360.billing.presentation.dto.response.PaymentResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BillingMapper {

    public InvoiceResponse toInvoiceResponse(InvoiceEntity invoice, List<InvoiceLineItemEntity> lineItems) {
        return InvoiceResponse.builder()
                .invoiceId(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .encounterId(invoice.getEncounterId())
                .patientId(invoice.getPatientId())
                .hospitalId(invoice.getHospitalId())
                .branchId(invoice.getBranchId())
                .status(invoice.getStatus())
                .currency(invoice.getCurrency())
                .subtotalAmount(invoice.getSubtotalAmount())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .amountPaid(invoice.getAmountPaid())
                .issuedAt(invoice.getIssuedAt())
                .paidAt(invoice.getPaidAt())
                .notes(invoice.getNotes())
                .lineItems(lineItems.stream().map(this::toLineItemResponse).toList())
                .build();
    }

    public InvoiceLineItemResponse toLineItemResponse(InvoiceLineItemEntity lineItem) {
        return InvoiceLineItemResponse.builder()
                .lineItemId(lineItem.getId())
                .description(lineItem.getDescription())
                .quantity(lineItem.getQuantity())
                .unitPrice(lineItem.getUnitPrice())
                .lineTotal(lineItem.getLineTotal())
                .sourceType(lineItem.getSourceType())
                .sourceId(lineItem.getSourceId())
                .build();
    }

    public PaymentResponse toPaymentResponse(PaymentEntity payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .invoiceId(payment.getInvoiceId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .gateway(payment.getGateway())
                .paymentMethod(payment.getPaymentMethod())
                .paidAt(payment.getPaidAt())
                .notes(payment.getNotes())
                .build();
    }
}
