package com.health360.billing.application.service;

import com.health360.billing.domain.InvoiceKind;
import com.health360.billing.domain.InvoiceLineSourceType;
import com.health360.billing.infrastructure.persistence.entity.ChargePostingEntity;
import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.billing.infrastructure.persistence.repository.ChargePostingRepository;
import com.health360.billing.infrastructure.persistence.repository.InvoiceRepository;
import com.health360.billing.presentation.dto.request.AttachChargesRequest;
import com.health360.billing.presentation.dto.request.CreateInvoiceLineItemRequest;
import com.health360.billing.presentation.dto.response.InvoiceResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChargeAttachService {

    private final ChargePostingRepository postingRepository;
    private final InvoiceRepository invoiceRepository;
    private final BillingService billingService;
    private final BillingAccessService accessService;
    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;

    @Transactional
    public InvoiceResponse attachToInvoice(UserPrincipal principal, AttachChargesRequest request) {
        accessService.assertCanWriteInvoices(principal);
        if (!principal.hasPermission("billing:charge:write")
                && !principal.hasPermission("billing:invoice:write")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }

        List<ChargePostingEntity> postings = postingRepository.findByTenantIdAndIdInAndDeletedAtIsNull(
                principal.getTenantId(), request.getChargePostingIds());
        if (postings.size() != new HashSet<>(request.getChargePostingIds()).size()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                    "One or more charge postings were not found");
        }

        for (ChargePostingEntity posting : postings) {
            if ("ATTACHED".equals(posting.getStatus()) || "CANCELLED".equals(posting.getStatus())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                        "Charge " + posting.getCatalogCode() + " is already " + posting.getStatus());
            }
        }

        ChargePostingEntity first = postings.get(0);
        featureAccessService.assertHasFeature(
                first.getHospitalId(), principal.getTenantId(), PlanFeatureKeys.FEATURE_CHARGE_ENGINE,
                "Charge engine is not enabled for this hospital");
        hospitalScopeService.assertHospitalScope(principal, first.getHospitalId(), first.getBranchId());

        UUID invoiceId = request.getInvoiceId();
        if (invoiceId == null) {
            if (first.getEncounterId() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "invoiceId is required when charge has no encounter");
            }
            InvoiceResponse created = billingService.createKindedInvoice(
                    principal,
                    first.getEncounterId(),
                    null,
                    InvoiceKind.INTERIM,
                    "Auto charges from charge engine",
                    List.of(),
                    false);
            invoiceId = created.getInvoiceId();
        }

        InvoiceEntity invoice = invoiceRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(invoiceId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Invoice not found"));
        accessService.assertCanWriteInvoice(principal, invoice);

        for (ChargePostingEntity posting : postings) {
            if (!posting.getHospitalId().equals(invoice.getHospitalId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Charge hospital does not match invoice");
            }
            if (posting.getPatientId() != null && !posting.getPatientId().equals(invoice.getPatientId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Charge patient does not match invoice");
            }
        }

        List<CreateInvoiceLineItemRequest> lines = new ArrayList<>();
        for (ChargePostingEntity posting : postings) {
            CreateInvoiceLineItemRequest line = new CreateInvoiceLineItemRequest();
            line.setDescription(posting.getDescription() + " (" + posting.getCatalogCode() + ")");
            line.setQuantity(posting.getQuantity());
            line.setUnitPrice(posting.getUnitPrice());
            line.setSourceType(InvoiceLineSourceType.CHARGE_ENGINE.name());
            line.setSourceId(posting.getId());
            lines.add(line);
        }

        InvoiceResponse response = billingService.appendLines(principal, invoice.getId(), lines);

        Set<UUID> attachedIds = new HashSet<>(request.getChargePostingIds());
        for (ChargePostingEntity posting : postings) {
            if (!attachedIds.contains(posting.getId())) {
                continue;
            }
            posting.setStatus("ATTACHED");
            posting.setInvoiceId(invoice.getId());
            posting.setMode("POST");
            posting.setUpdatedBy(principal.getUserId());
            posting.touch();
        }
        postingRepository.saveAll(postings);

        if (response.getLineItems() != null) {
            for (ChargePostingEntity posting : postings) {
                response.getLineItems().stream()
                        .filter(li -> posting.getId().equals(li.getSourceId()))
                        .findFirst()
                        .ifPresent(li -> {
                            posting.setInvoiceLineId(li.getLineItemId());
                            postingRepository.save(posting);
                        });
            }
        }

        return response;
    }
}
