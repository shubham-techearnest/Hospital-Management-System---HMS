package com.health360.patient.application.service;

import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.billing.infrastructure.persistence.repository.InvoiceRepository;
import com.health360.clinical.domain.PrescriptionStatus;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionEntity;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.laboratory.infrastructure.persistence.entity.LabOrderEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabReportEntity;
import com.health360.laboratory.infrastructure.persistence.repository.LabOrderRepository;
import com.health360.laboratory.infrastructure.persistence.repository.LabReportRepository;
import com.health360.patient.infrastructure.persistence.entity.HealthDocumentEntity;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.HealthDocumentRepository;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.presentation.dto.response.DocumentCenterItemResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * ECO-P6: unified document center — uploads + system-linked Rx / lab reports / invoices.
 */
@Service
@RequiredArgsConstructor
public class DocumentCenterService {

    private final PatientProfileRepository patientProfileRepository;
    private final HealthDocumentRepository healthDocumentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabOrderRepository labOrderRepository;
    private final LabReportRepository labReportRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public List<DocumentCenterItemResponse> listMyDocuments(UserPrincipal principal, String categoryFilter) {
        PatientProfileEntity profile = requireConsentedPatient(principal);
        UUID tenantId = principal.getTenantId();
        UUID patientId = profile.getId();
        String filter = categoryFilter == null || categoryFilter.isBlank()
                ? null
                : categoryFilter.trim().toUpperCase(Locale.ROOT);

        List<DocumentCenterItemResponse> items = new ArrayList<>();

        for (HealthDocumentEntity doc : healthDocumentRepository
                .findByPatientIdAndDeletedAtIsNullOrderByUploadedAtDesc(patientId, PageRequest.of(0, 100))
                .getContent()) {
            items.add(DocumentCenterItemResponse.builder()
                    .itemId("UPLOAD:" + doc.getId())
                    .source("UPLOAD")
                    .category(doc.getCategory())
                    .title(doc.getTitle())
                    .description(doc.getDescription())
                    .occurredAt(doc.getUploadedAt())
                    .referenceId(doc.getId())
                    .deepLink("/patient/reports")
                    .downloadable(true)
                    .build());
        }

        for (PrescriptionEntity rx : prescriptionRepository
                .findByTenantIdAndPatientIdAndStatusAndDeletedAtIsNullOrderBySignedAtDesc(
                        tenantId, patientId, PrescriptionStatus.SIGNED.name())) {
            Instant when = rx.getSignedAt() != null ? rx.getSignedAt() : rx.getCreatedAt();
            items.add(DocumentCenterItemResponse.builder()
                    .itemId("RX:" + rx.getId())
                    .source("SYSTEM")
                    .category("PRESCRIPTION")
                    .title("e-Prescription " + rx.getPrescriptionNumber())
                    .description("Signed prescription")
                    .occurredAt(when)
                    .referenceId(rx.getId())
                    .deepLink("/patient/prescriptions")
                    .downloadable(false)
                    .build());
        }

        for (LabOrderEntity order : labOrderRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByReceivedAtDesc(tenantId, patientId)) {
            if (!"RELEASED".equals(order.getStatus())) {
                continue;
            }
            LabReportEntity report = labReportRepository.findByLabOrderIdAndDeletedAtIsNull(order.getId()).orElse(null);
            Instant when = report != null && report.getReleasedAt() != null
                    ? report.getReleasedAt()
                    : order.getReceivedAt();
            items.add(DocumentCenterItemResponse.builder()
                    .itemId("LAB:" + order.getId())
                    .source("SYSTEM")
                    .category("LAB_REPORT")
                    .title("Lab report")
                    .description("Released hospital lab report")
                    .occurredAt(when)
                    .referenceId(report != null ? report.getId() : order.getId())
                    .deepLink("/patient/lab-values")
                    .downloadable(false)
                    .build());
        }

        for (InvoiceEntity invoice : invoiceRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByIssuedAtDesc(
                        tenantId, patientId, PageRequest.of(0, 50))
                .getContent()) {
            items.add(DocumentCenterItemResponse.builder()
                    .itemId("INV:" + invoice.getId())
                    .source("SYSTEM")
                    .category("INVOICE")
                    .title("Invoice " + invoice.getInvoiceNumber())
                    .description(invoice.getStatus() + " · " + invoice.getCurrency() + " " + invoice.getTotalAmount())
                    .occurredAt(invoice.getIssuedAt())
                    .referenceId(invoice.getId())
                    .deepLink("/patient/reports")
                    .downloadable(false)
                    .build());
        }

        items.sort(Comparator.comparing(DocumentCenterItemResponse::getOccurredAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        if (filter == null) {
            return items;
        }
        return items.stream().filter(i -> filter.equals(i.getCategory())).toList();
    }

    private PatientProfileEntity requireConsentedPatient(UserPrincipal principal) {
        PatientProfileEntity profile = patientProfileRepository
                .findByTenantIdAndUserIdAndDeletedAtIsNull(principal.getTenantId(), principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient profile not found"));
        if (!profile.isConsentAccepted()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Health data consent must be accepted before accessing documents");
        }
        return profile;
    }
}
