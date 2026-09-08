package com.health360.ipd.application.service;

import com.health360.billing.application.service.BillingService;
import com.health360.billing.domain.InvoiceKind;
import com.health360.billing.presentation.dto.request.CreateInvoiceLineItemRequest;
import com.health360.billing.presentation.dto.request.RecordPaymentRequest;
import com.health360.billing.presentation.dto.response.InvoiceResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.ipd.domain.IpdServiceKeys;
import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionPayerEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdChargeEventEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdFinancialClearanceEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdPayerAuthorizationEntity;
import com.health360.ipd.infrastructure.persistence.repository.IpdAdmissionPayerRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdAdmissionRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdChargeEventRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdFinancialClearanceRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdPayerAuthorizationRepository;
import com.health360.ipd.presentation.dto.request.AssignIpdPayerRequest;
import com.health360.ipd.presentation.dto.request.ClearIpdFinancialRequest;
import com.health360.ipd.presentation.dto.request.CreateIpdChargeEventRequest;
import com.health360.ipd.presentation.dto.request.CreateIpdDepositRequest;
import com.health360.ipd.presentation.dto.request.CreatePayerAuthorizationRequest;
import com.health360.ipd.presentation.dto.request.DecidePayerAuthorizationRequest;
import com.health360.ipd.presentation.dto.response.IpdAdmissionPayerResponse;
import com.health360.ipd.presentation.dto.response.IpdChargeEventResponse;
import com.health360.ipd.presentation.dto.response.IpdFinancialClearanceResponse;
import com.health360.ipd.presentation.dto.response.IpdPayerAuthorizationResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IpdBillingService {

    private static final Set<String> CHARGE_TYPES = Set.of("BED_DAY", "NURSING", "PROCEDURE", "MANUAL", "OTHER");
    private static final Set<String> PAYER_MODES = Set.of("SELF_PAY", "INSURANCE", "TPA", "CORPORATE", "GOVERNMENT");
    private static final Set<String> CLAIM_MODES = Set.of("CASHLESS", "REIMBURSEMENT", "CO_PAY", "PACKAGE");
    private static final Set<String> AUTH_TYPES = Set.of("ELIGIBILITY", "PRE_AUTH", "ENHANCEMENT", "FINAL_AUTH");
    private static final Set<String> AUTH_DECISIONS = Set.of("APPROVED", "DENIED", "EXPIRED", "CANCELLED");
    private static final Set<String> INSURED_MODES = Set.of("INSURANCE", "TPA", "CORPORATE", "GOVERNMENT");

    private final IpdAdmissionRepository admissionRepository;
    private final IpdChargeEventRepository chargeEventRepository;
    private final IpdAdmissionPayerRepository payerRepository;
    private final IpdPayerAuthorizationRepository authorizationRepository;
    private final IpdFinancialClearanceRepository clearanceRepository;
    private final BillingService billingService;
    private final IpdAccessService accessService;
    private final IpdServiceCatalogService catalogService;
    private final AuditLogService auditLogService;

    @Transactional
    public IpdChargeEventResponse createChargeEvent(
            UserPrincipal principal, UUID admissionId, CreateIpdChargeEventRequest request) {
        IpdAdmissionEntity admission = requireWritableAdmission(principal, admissionId);
        String chargeType = request.getChargeType().trim().toUpperCase(Locale.ROOT);
        if (!CHARGE_TYPES.contains(chargeType)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid charge type");
        }

        LocalDate serviceDate = request.getServiceDate() != null ? request.getServiceDate() : LocalDate.now();
        if ("BED_DAY".equals(chargeType)
                && chargeEventRepository.existsByAdmissionIdAndChargeTypeAndServiceDateAndDeletedAtIsNullAndStatusNot(
                        admissionId, chargeType, serviceDate, "VOID")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Bed-day charge already exists for this date");
        }

        BigDecimal qty = request.getQuantity().setScale(2, RoundingMode.HALF_UP);
        BigDecimal unit = request.getUnitPrice().setScale(2, RoundingMode.HALF_UP);
        BigDecimal amount = qty.multiply(unit).setScale(2, RoundingMode.HALF_UP);

        IpdChargeEventEntity entity = new IpdChargeEventEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(admission.getHospitalId());
        entity.setAdmissionId(admission.getId());
        entity.setEncounterId(admission.getEncounterId());
        entity.setChargeType(chargeType);
        entity.setDescription(request.getDescription().trim());
        entity.setQuantity(qty);
        entity.setUnitPrice(unit);
        entity.setAmount(amount);
        entity.setServiceDate(serviceDate);
        entity.setStatus("PENDING");
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        IpdChargeEventEntity saved = chargeEventRepository.save(entity);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_CHARGE_CREATED",
                "IpdChargeEvent", saved.getId(), Map.of("chargeType", chargeType));
        return toChargeResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<IpdChargeEventResponse> listChargeEvents(UserPrincipal principal, UUID admissionId) {
        IpdAdmissionEntity admission = requireReadableAdmission(principal, admissionId);
        return chargeEventRepository
                .findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByServiceDateDescCreatedAtDesc(
                        principal.getTenantId(), admission.getId())
                .stream()
                .map(this::toChargeResponse)
                .toList();
    }

    @Transactional
    public InvoiceResponse postPendingCharges(UserPrincipal principal, UUID admissionId) {
        IpdAdmissionEntity admission = requireWritableAdmission(principal, admissionId);
        accessService.assertIpdServiceEnabled(
                principal, admission.getHospitalId(), IpdServiceKeys.IPD_INTERIM_BILLING,
                "Interim billing is disabled for this hospital");

        List<IpdChargeEventEntity> pending = chargeEventRepository
                .findByTenantIdAndAdmissionIdAndStatusAndDeletedAtIsNullOrderByServiceDateAsc(
                        principal.getTenantId(), admissionId, "PENDING");
        if (pending.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "No pending charges to post");
        }

        List<CreateInvoiceLineItemRequest> lines = new ArrayList<>();
        for (IpdChargeEventEntity charge : pending) {
            CreateInvoiceLineItemRequest line = new CreateInvoiceLineItemRequest();
            line.setDescription(charge.getDescription() + " (" + charge.getChargeType() + ")");
            line.setQuantity(charge.getQuantity());
            line.setUnitPrice(charge.getUnitPrice());
            line.setSourceType(mapChargeSource(charge.getChargeType()));
            line.setSourceId(charge.getId());
            lines.add(line);
        }

        InvoiceResponse invoice = billingService.createKindedInvoice(
                principal,
                admission.getEncounterId(),
                admission.getId(),
                InvoiceKind.INTERIM,
                "IPD interim bill",
                lines,
                false);

        for (IpdChargeEventEntity charge : pending) {
            charge.setStatus("POSTED");
            charge.setInvoiceId(invoice.getInvoiceId());
            invoice.getLineItems().stream()
                    .filter(l -> charge.getId().equals(l.getSourceId()))
                    .findFirst()
                    .ifPresent(l -> charge.setInvoiceLineId(l.getLineItemId()));
            charge.setUpdatedBy(principal.getUserId());
            charge.touch();
            chargeEventRepository.save(charge);
        }

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_INTERIM_INVOICE",
                "IpdAdmission", admissionId, Map.of("invoiceId", invoice.getInvoiceId().toString()));
        return invoice;
    }

    @Transactional
    public InvoiceResponse createDeposit(UserPrincipal principal, UUID admissionId, CreateIpdDepositRequest request) {
        IpdAdmissionEntity admission = requireWritableAdmission(principal, admissionId);
        accessService.assertIpdServiceEnabled(
                principal, admission.getHospitalId(), IpdServiceKeys.IPD_DEPOSIT,
                "Admission deposits are disabled for this hospital");

        CreateInvoiceLineItemRequest line = new CreateInvoiceLineItemRequest();
        line.setDescription("IPD admission deposit");
        line.setQuantity(BigDecimal.ONE);
        line.setUnitPrice(request.getAmount().setScale(2, RoundingMode.HALF_UP));
        line.setSourceType("DEPOSIT");

        InvoiceResponse invoice = billingService.createKindedInvoice(
                principal,
                admission.getEncounterId(),
                admission.getId(),
                InvoiceKind.DEPOSIT,
                trimToNull(request.getNotes()),
                List.of(line),
                false);

        RecordPaymentRequest payment = new RecordPaymentRequest();
        payment.setAmount(request.getAmount().setScale(2, RoundingMode.HALF_UP));
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
        payment.setNotes(trimToNull(request.getNotes()));
        billingService.recordPayment(principal, invoice.getInvoiceId(), payment);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_DEPOSIT_RECORDED",
                "IpdAdmission", admissionId, Map.of("amount", request.getAmount().toPlainString()));
        return billingService.getInvoice(principal, invoice.getInvoiceId());
    }

    @Transactional
    public IpdAdmissionPayerResponse assignPayer(
            UserPrincipal principal, UUID admissionId, AssignIpdPayerRequest request) {
        IpdAdmissionEntity admission = requireWritableAdmission(principal, admissionId);
        String mode = request.getPayerMode().trim().toUpperCase(Locale.ROOT);
        if (!PAYER_MODES.contains(mode)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid payer mode");
        }
        if (INSURED_MODES.contains(mode)) {
            accessService.assertIpdServiceEnabled(
                    principal, admission.getHospitalId(), IpdServiceKeys.IPD_INSURANCE_TPA,
                    "Insurance / TPA payer workflows are disabled for this hospital");
        }

        String claimMode = null;
        if (request.getClaimMode() != null && !request.getClaimMode().isBlank()) {
            claimMode = request.getClaimMode().trim().toUpperCase(Locale.ROOT);
            if (!CLAIM_MODES.contains(claimMode)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid claim mode");
            }
        }

        boolean primary = request.getPrimaryPayer() == null || request.getPrimaryPayer();
        if (primary) {
            payerRepository.findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByCreatedAtAsc(
                            principal.getTenantId(), admissionId)
                    .forEach(existing -> {
                        if (existing.isPrimaryPayer()) {
                            existing.setPrimaryPayer(false);
                            existing.setUpdatedBy(principal.getUserId());
                            existing.touch();
                            payerRepository.save(existing);
                        }
                    });
        }

        IpdAdmissionPayerEntity entity = new IpdAdmissionPayerEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(admission.getHospitalId());
        entity.setAdmissionId(admission.getId());
        entity.setEncounterId(admission.getEncounterId());
        entity.setPayerMode(mode);
        entity.setPayerName(trimToNull(request.getPayerName()));
        entity.setPolicyNumber(trimToNull(request.getPolicyNumber()));
        entity.setMemberId(trimToNull(request.getMemberId()));
        entity.setClaimMode(claimMode);
        entity.setPrimaryPayer(primary);
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        IpdAdmissionPayerEntity saved = payerRepository.save(entity);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_PAYER_ASSIGNED",
                "IpdAdmissionPayer", saved.getId(), Map.of("payerMode", mode));
        return toPayerResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<IpdAdmissionPayerResponse> listPayers(UserPrincipal principal, UUID admissionId) {
        requireReadableAdmission(principal, admissionId);
        return payerRepository
                .findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByCreatedAtAsc(
                        principal.getTenantId(), admissionId)
                .stream()
                .map(this::toPayerResponse)
                .toList();
    }

    @Transactional
    public IpdPayerAuthorizationResponse createAuthorization(
            UserPrincipal principal, UUID admissionId, CreatePayerAuthorizationRequest request) {
        IpdAdmissionEntity admission = requireWritableAdmission(principal, admissionId);
        accessService.assertIpdServiceEnabled(
                principal, admission.getHospitalId(), IpdServiceKeys.IPD_INSURANCE_TPA,
                "Insurance / TPA payer workflows are disabled for this hospital");

        String authType = request.getAuthType().trim().toUpperCase(Locale.ROOT);
        if (!AUTH_TYPES.contains(authType)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid auth type");
        }

        IpdPayerAuthorizationEntity entity = new IpdPayerAuthorizationEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(admission.getHospitalId());
        entity.setAdmissionId(admission.getId());
        entity.setEncounterId(admission.getEncounterId());
        entity.setPayerId(request.getPayerId());
        entity.setAuthType(authType);
        entity.setStatus("REQUESTED");
        entity.setAuthNumber(trimToNull(request.getAuthNumber()));
        entity.setApprovedAmount(request.getApprovedAmount());
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setRequestedAt(Instant.now());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        IpdPayerAuthorizationEntity saved = authorizationRepository.save(entity);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_AUTH_REQUESTED",
                "IpdPayerAuthorization", saved.getId(), Map.of("authType", authType));
        return toAuthResponse(saved);
    }

    @Transactional
    public IpdPayerAuthorizationResponse decideAuthorization(
            UserPrincipal principal, UUID admissionId, UUID authorizationId, DecidePayerAuthorizationRequest request) {
        requireWritableAdmission(principal, admissionId);
        IpdPayerAuthorizationEntity entity = authorizationRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(authorizationId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Authorization not found"));
        if (!entity.getAdmissionId().equals(admissionId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Authorization does not belong to this admission");
        }

        String status = request.getStatus().trim().toUpperCase(Locale.ROOT);
        if (!AUTH_DECISIONS.contains(status)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid decision status");
        }

        entity.setStatus(status);
        if (request.getAuthNumber() != null) {
            entity.setAuthNumber(trimToNull(request.getAuthNumber()));
        }
        if (request.getApprovedAmount() != null) {
            entity.setApprovedAmount(request.getApprovedAmount());
        }
        if (request.getNotes() != null) {
            entity.setNotes(trimToNull(request.getNotes()));
        }
        entity.setDecidedAt(Instant.now());
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        authorizationRepository.save(entity);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_AUTH_DECIDED",
                "IpdPayerAuthorization", entity.getId(), Map.of("status", status));
        return toAuthResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<IpdPayerAuthorizationResponse> listAuthorizations(UserPrincipal principal, UUID admissionId) {
        requireReadableAdmission(principal, admissionId);
        return authorizationRepository
                .findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByRequestedAtDesc(
                        principal.getTenantId(), admissionId)
                .stream()
                .map(this::toAuthResponse)
                .toList();
    }

    @Transactional
    public IpdFinancialClearanceResponse clearFinancial(
            UserPrincipal principal, UUID admissionId, ClearIpdFinancialRequest request) {
        IpdAdmissionEntity admission = requireWritableAdmission(principal, admissionId);
        assertPayerAuthIfRequired(principal, admission);

        IpdFinancialClearanceEntity clearance = clearanceRepository
                .findByAdmissionIdAndDeletedAtIsNull(admissionId)
                .orElseGet(() -> {
                    IpdFinancialClearanceEntity created = new IpdFinancialClearanceEntity();
                    created.setTenantId(principal.getTenantId());
                    created.setHospitalId(admission.getHospitalId());
                    created.setAdmissionId(admission.getId());
                    created.setEncounterId(admission.getEncounterId());
                    created.setCreatedBy(principal.getUserId());
                    return created;
                });

        clearance.setStatus("CLEARED");
        clearance.setClearedAt(Instant.now());
        clearance.setClearedBy(principal.getUserId());
        clearance.setNotes(trimToNull(request != null ? request.getNotes() : null));
        clearance.setUpdatedBy(principal.getUserId());
        clearance.touch();
        IpdFinancialClearanceEntity saved = clearanceRepository.save(clearance);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_FINANCIAL_CLEARED",
                "IpdAdmission", admissionId, Map.of());
        return toClearanceResponse(saved);
    }

    @Transactional(readOnly = true)
    public IpdFinancialClearanceResponse getFinancialClearance(UserPrincipal principal, UUID admissionId) {
        requireReadableAdmission(principal, admissionId);
        return clearanceRepository.findByAdmissionIdAndDeletedAtIsNull(admissionId)
                .map(this::toClearanceResponse)
                .orElse(IpdFinancialClearanceResponse.builder()
                        .admissionId(admissionId)
                        .status("PENDING")
                        .build());
    }

    /** Called from discharge — blocks when hospital config requires clearance / auth. */
    @Transactional(readOnly = true)
    public void assertReadyForDischarge(UserPrincipal principal, IpdAdmissionEntity admission) {
        Map<String, Object> country = catalogService.resolveCountryConfig(
                admission.getHospitalId(), principal.getTenantId());
        boolean requireClearance = boolFlag(country, "requireFinancialClearanceBeforeDischarge", false);
        if (requireClearance) {
            boolean cleared = clearanceRepository.findByAdmissionIdAndDeletedAtIsNull(admission.getId())
                    .map(c -> "CLEARED".equals(c.getStatus()))
                    .orElse(false);
            if (!cleared) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                        "Financial clearance is required before discharge");
            }
        }
        assertPayerAuthIfRequired(principal, admission);
    }

    private void assertPayerAuthIfRequired(UserPrincipal principal, IpdAdmissionEntity admission) {
        Map<String, Object> country = catalogService.resolveCountryConfig(
                admission.getHospitalId(), principal.getTenantId());
        boolean requirePreAuth = boolFlag(country, "requirePreAuthWhenInsurance", false);
        if (!requirePreAuth) {
            return;
        }
        if (!catalogService.isServiceEnabled(admission.getHospitalId(), principal.getTenantId(),
                IpdServiceKeys.IPD_INSURANCE_TPA)) {
            return;
        }

        var primary = payerRepository.findFirstByTenantIdAndAdmissionIdAndPrimaryPayerTrueAndDeletedAtIsNull(
                principal.getTenantId(), admission.getId());
        if (primary.isEmpty() || !INSURED_MODES.contains(primary.get().getPayerMode())) {
            return;
        }

        boolean approved = authorizationRepository
                .existsByTenantIdAndAdmissionIdAndAuthTypeAndStatusAndDeletedAtIsNull(
                        principal.getTenantId(), admission.getId(), "PRE_AUTH", "APPROVED")
                || authorizationRepository
                .existsByTenantIdAndAdmissionIdAndAuthTypeAndStatusAndDeletedAtIsNull(
                        principal.getTenantId(), admission.getId(), "FINAL_AUTH", "APPROVED");
        if (!approved) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Approved pre-auth or final auth is required for this payer before clearance/discharge");
        }
    }

    private IpdAdmissionEntity requireWritableAdmission(UserPrincipal principal, UUID admissionId) {
        accessService.assertCanManageAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);
        return admission;
    }

    private IpdAdmissionEntity requireReadableAdmission(UserPrincipal principal, UUID admissionId) {
        accessService.assertCanReadAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);
        return admission;
    }

    private IpdAdmissionEntity requireAdmission(UUID tenantId, UUID admissionId) {
        return admissionRepository.findByIdAndTenantIdAndDeletedAtIsNull(admissionId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Admission not found"));
    }

    private static String mapChargeSource(String chargeType) {
        return switch (chargeType) {
            case "BED_DAY" -> "BED_DAY";
            case "NURSING" -> "NURSING";
            case "PROCEDURE" -> "PROCEDURE";
            default -> "IPD_CHARGE";
        };
    }

    private static boolean boolFlag(Map<String, Object> cfg, String key, boolean defaultValue) {
        Object value = cfg.get(key);
        if (value instanceof Boolean b) {
            return b;
        }
        if (value instanceof String s) {
            return Boolean.parseBoolean(s);
        }
        return defaultValue;
    }

    private IpdChargeEventResponse toChargeResponse(IpdChargeEventEntity entity) {
        return IpdChargeEventResponse.builder()
                .chargeEventId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .encounterId(entity.getEncounterId())
                .chargeType(entity.getChargeType())
                .description(entity.getDescription())
                .quantity(entity.getQuantity())
                .unitPrice(entity.getUnitPrice())
                .amount(entity.getAmount())
                .serviceDate(entity.getServiceDate())
                .status(entity.getStatus())
                .invoiceId(entity.getInvoiceId())
                .invoiceLineId(entity.getInvoiceLineId())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private IpdAdmissionPayerResponse toPayerResponse(IpdAdmissionPayerEntity entity) {
        return IpdAdmissionPayerResponse.builder()
                .payerId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .payerMode(entity.getPayerMode())
                .payerName(entity.getPayerName())
                .policyNumber(entity.getPolicyNumber())
                .memberId(entity.getMemberId())
                .claimMode(entity.getClaimMode())
                .primaryPayer(entity.isPrimaryPayer())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private IpdPayerAuthorizationResponse toAuthResponse(IpdPayerAuthorizationEntity entity) {
        return IpdPayerAuthorizationResponse.builder()
                .authorizationId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .payerId(entity.getPayerId())
                .authType(entity.getAuthType())
                .status(entity.getStatus())
                .authNumber(entity.getAuthNumber())
                .approvedAmount(entity.getApprovedAmount())
                .notes(entity.getNotes())
                .requestedAt(entity.getRequestedAt())
                .decidedAt(entity.getDecidedAt())
                .build();
    }

    private IpdFinancialClearanceResponse toClearanceResponse(IpdFinancialClearanceEntity entity) {
        return IpdFinancialClearanceResponse.builder()
                .clearanceId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .status(entity.getStatus())
                .clearedAt(entity.getClearedAt())
                .clearedBy(entity.getClearedBy())
                .notes(entity.getNotes())
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
