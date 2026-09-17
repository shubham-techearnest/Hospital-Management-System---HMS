package com.health360.insurance.application.service;

import com.health360.automation.application.service.ApprovalService;
import com.health360.automation.application.service.EventPublisher;
import com.health360.automation.domain.HospitalEventTypes;
import com.health360.automation.domain.TaskTypes;
import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.billing.infrastructure.persistence.repository.InvoiceRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.insurance.infrastructure.persistence.entity.InsuranceClaimEntity;
import com.health360.insurance.infrastructure.persistence.entity.InsurancePayerEntity;
import com.health360.insurance.infrastructure.persistence.entity.InsurancePolicyEntity;
import com.health360.insurance.infrastructure.persistence.entity.InsurancePreAuthorizationEntity;
import com.health360.insurance.infrastructure.persistence.repository.InsuranceClaimRepository;
import com.health360.insurance.infrastructure.persistence.repository.InsurancePayerRepository;
import com.health360.insurance.infrastructure.persistence.repository.InsurancePolicyRepository;
import com.health360.insurance.infrastructure.persistence.repository.InsurancePreAuthorizationRepository;
import com.health360.insurance.presentation.dto.request.CreateInsuranceClaimRequest;
import com.health360.insurance.presentation.dto.request.CreateInsurancePayerRequest;
import com.health360.insurance.presentation.dto.request.CreateInsurancePolicyRequest;
import com.health360.insurance.presentation.dto.request.CreatePreAuthorizationRequest;
import com.health360.insurance.presentation.dto.request.DecideInsuranceClaimRequest;
import com.health360.insurance.presentation.dto.request.DecidePreAuthorizationRequest;
import com.health360.insurance.presentation.dto.response.InsuranceClaimResponse;
import com.health360.insurance.presentation.dto.response.InsurancePayerResponse;
import com.health360.insurance.presentation.dto.response.InsurancePolicyResponse;
import com.health360.insurance.presentation.dto.response.PreAuthorizationResponse;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.tasks.application.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InsuranceService {

    private static final Set<String> PAYER_TYPES = Set.of("INSURER", "TPA", "CORPORATE", "GOVERNMENT");
    private static final Set<String> CLAIM_MODES = Set.of("CASHLESS", "REIMBURSEMENT", "CO_PAY", "PACKAGE");
    private static final Set<String> AUTH_TYPES = Set.of("PRE_AUTH", "ENHANCEMENT", "FINAL");

    private final InsurancePayerRepository payerRepository;
    private final InsurancePolicyRepository policyRepository;
    private final InsurancePreAuthorizationRepository authRepository;
    private final InsuranceClaimRepository claimRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final InvoiceRepository invoiceRepository;
    private final InsuranceAccessService accessService;
    private final ApprovalService approvalService;
    private final EventPublisher eventPublisher;
    private final TaskService taskService;
    private final AuditLogService auditLogService;

    @Transactional
    public InsurancePayerResponse createPayer(UserPrincipal principal, CreateInsurancePayerRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId());

        String code = request.getCode().trim().toUpperCase(Locale.ROOT);
        if (payerRepository.existsByHospitalIdAndCodeAndDeletedAtIsNull(request.getHospitalId(), code)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT, "Payer code already exists");
        }
        String payerType = normalize(request.getPayerType(), "TPA", PAYER_TYPES, "Invalid payer type");

        InsurancePayerEntity entity = new InsurancePayerEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setCode(code);
        entity.setName(request.getName().trim());
        entity.setPayerType(payerType);
        entity.setContactPhone(trimToNull(request.getContactPhone()));
        entity.setContactEmail(trimToNull(request.getContactEmail()));
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setActive(true);
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        InsurancePayerEntity saved = payerRepository.save(entity);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "INSURANCE_PAYER_CREATED",
                "InsurancePayer", saved.getId(), Map.of("code", saved.getCode()));
        return toPayerResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<InsurancePayerResponse> listPayers(UserPrincipal principal, UUID hospitalId) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId);
        return payerRepository
                .findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByNameAsc(principal.getTenantId(), hospitalId)
                .stream()
                .map(this::toPayerResponse)
                .toList();
    }

    @Transactional
    public InsurancePolicyResponse createPolicy(UserPrincipal principal, CreateInsurancePolicyRequest request) {
        accessService.assertCanWrite(principal);
        accessService.assertModuleEnabled(principal, request.getHospitalId(), request.getBranchId());

        patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getPatientId(), principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient not found"));
        InsurancePayerEntity payer = requirePayer(principal.getTenantId(), request.getPayerId());
        if (!payer.getHospitalId().equals(request.getHospitalId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Payer hospital mismatch");
        }

        String policyNumber = request.getPolicyNumber().trim();
        if (policyRepository.existsByHospitalIdAndPayerIdAndPolicyNumberAndDeletedAtIsNull(
                request.getHospitalId(), payer.getId(), policyNumber)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Policy number already exists for this payer");
        }

        String claimMode = normalize(request.getClaimMode(), "CASHLESS", CLAIM_MODES, "Invalid claim mode");

        InsurancePolicyEntity entity = new InsurancePolicyEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setPatientId(request.getPatientId());
        entity.setPayerId(payer.getId());
        entity.setPolicyNumber(policyNumber);
        entity.setMemberId(trimToNull(request.getMemberId()));
        entity.setHolderName(trimToNull(request.getHolderName()));
        entity.setClaimMode(claimMode);
        entity.setStatus("ACTIVE");
        entity.setValidFrom(request.getValidFrom());
        entity.setValidTo(request.getValidTo());
        entity.setCoverageLimit(request.getCoverageLimit());
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        InsurancePolicyEntity saved = policyRepository.save(entity);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "INSURANCE_POLICY_CREATED",
                "InsurancePolicy", saved.getId(), Map.of("policyNumber", saved.getPolicyNumber()));
        return toPolicyResponse(saved, payer);
    }

    @Transactional(readOnly = true)
    public Page<InsurancePolicyResponse> listPolicies(
            UserPrincipal principal, UUID hospitalId, UUID branchId, UUID patientId, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        Page<InsurancePolicyEntity> page = patientId != null
                ? policyRepository.findByTenantIdAndHospitalIdAndBranchIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, patientId, pageable)
                : policyRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(p -> toPolicyResponse(p, payerRepository.findById(p.getPayerId()).orElse(null)));
    }

    @Transactional
    public PreAuthorizationResponse requestPreAuth(UserPrincipal principal, CreatePreAuthorizationRequest request) {
        accessService.assertCanWrite(principal);
        InsurancePolicyEntity policy = requirePolicy(principal.getTenantId(), request.getPolicyId());
        accessService.assertModuleEnabled(principal, policy.getHospitalId(), policy.getBranchId());
        if (!"ACTIVE".equals(policy.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT, "Policy is not ACTIVE");
        }

        String authType = normalize(request.getAuthType(), "PRE_AUTH", AUTH_TYPES, "Invalid auth type");

        InsurancePreAuthorizationEntity entity = new InsurancePreAuthorizationEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(policy.getHospitalId());
        entity.setBranchId(policy.getBranchId());
        entity.setPolicyId(policy.getId());
        entity.setPatientId(policy.getPatientId());
        entity.setEncounterId(request.getEncounterId());
        entity.setAdmissionId(request.getAdmissionId());
        entity.setAuthNumber(allocateNumber("AUTH"));
        entity.setAuthType(authType);
        entity.setStatus("REQUESTED");
        entity.setRequestedAmount(request.getRequestedAmount());
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setRequestedAt(Instant.now());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        InsurancePreAuthorizationEntity saved = authRepository.save(entity);

        Map<String, Object> payload = new HashMap<>();
        payload.put("authNumber", saved.getAuthNumber());
        payload.put("authType", saved.getAuthType());
        payload.put("policyId", policy.getId().toString());
        payload.put("requestedAmount", saved.getRequestedAmount());

        approvalService.create(
                principal.getTenantId(),
                saved.getHospitalId(),
                "INSURANCE_PRE_AUTH",
                "InsurancePreAuthorization",
                saved.getId(),
                principal.getUserId(),
                payload);

        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(HospitalEventTypes.PRE_AUTH_REQUESTED)
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .entityType("InsurancePreAuthorization")
                .entityId(saved.getId())
                .correlationId(policy.getId())
                .sourceModule("INSURANCE")
                .payload(payload)
                .build());

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "INSURANCE_PRE_AUTH_REQUESTED",
                "InsurancePreAuthorization", saved.getId(), Map.of("authNumber", saved.getAuthNumber()));
        return toAuthResponse(saved);
    }

    @Transactional
    public PreAuthorizationResponse decidePreAuth(
            UserPrincipal principal, UUID authId, DecidePreAuthorizationRequest request) {
        accessService.assertCanApprove(principal);
        InsurancePreAuthorizationEntity entity = requireAuth(principal.getTenantId(), authId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());

        if (!"REQUESTED".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT, "Pre-auth already decided");
        }

        String decision = request.getDecision().trim().toUpperCase(Locale.ROOT);
        if (!"APPROVED".equals(decision) && !"REJECTED".equals(decision)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Decision must be APPROVED or REJECTED");
        }

        entity.setStatus(decision);
        entity.setDecidedAt(Instant.now());
        entity.setDecidedBy(principal.getUserId());
        entity.setDecisionNotes(trimToNull(request.getDecisionNotes()));
        if ("APPROVED".equals(decision)) {
            entity.setApprovedAmount(request.getApprovedAmount() != null
                    ? request.getApprovedAmount()
                    : entity.getRequestedAmount());
        }
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        InsurancePreAuthorizationEntity saved = authRepository.save(entity);

        approvalService.syncPendingDecision(
                principal.getTenantId(),
                "InsurancePreAuthorization",
                saved.getId(),
                decision,
                principal.getUserId(),
                request.getDecisionNotes());
        taskService.completeOpenTasksForEntity(
                principal.getTenantId(),
                "InsurancePreAuthorization",
                saved.getId(),
                TaskTypes.REVIEW_PRE_AUTH,
                principal.getUserId());

        Map<String, Object> payload = new HashMap<>();
        payload.put("authNumber", saved.getAuthNumber());
        payload.put("decision", decision);
        payload.put("approvedAmount", saved.getApprovedAmount());
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(HospitalEventTypes.PRE_AUTH_DECIDED)
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .entityType("InsurancePreAuthorization")
                .entityId(saved.getId())
                .correlationId(saved.getPolicyId())
                .sourceModule("INSURANCE")
                .payload(payload)
                .build());

        return toAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PreAuthorizationResponse> listPreAuths(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        Page<InsurancePreAuthorizationEntity> page = status != null && !status.isBlank()
                ? authRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByRequestedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, status.trim().toUpperCase(Locale.ROOT), pageable)
                : authRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByRequestedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(this::toAuthResponse);
    }

    @Transactional
    public InsuranceClaimResponse createClaim(UserPrincipal principal, CreateInsuranceClaimRequest request) {
        accessService.assertCanWrite(principal);
        InsurancePolicyEntity policy = requirePolicy(principal.getTenantId(), request.getPolicyId());
        accessService.assertModuleEnabled(principal, policy.getHospitalId(), policy.getBranchId());

        if (request.getClaimedAmount() == null || request.getClaimedAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "claimedAmount must be positive");
        }

        UUID encounterId = request.getEncounterId();
        UUID admissionId = request.getAdmissionId();
        if (request.getInvoiceId() != null) {
            InvoiceEntity invoice = invoiceRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(request.getInvoiceId(), principal.getTenantId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Invoice not found"));
            if (!invoice.getHospitalId().equals(policy.getHospitalId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Invoice hospital mismatch");
            }
            if (encounterId == null) {
                encounterId = invoice.getEncounterId();
            }
            if (admissionId == null) {
                admissionId = invoice.getAdmissionId();
            }
        }

        if (request.getPreAuthorizationId() != null) {
            InsurancePreAuthorizationEntity auth = requireAuth(principal.getTenantId(), request.getPreAuthorizationId());
            if (!auth.getPolicyId().equals(policy.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Pre-auth does not belong to this policy");
            }
            if (!"APPROVED".equals(auth.getStatus())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                        "Pre-auth must be APPROVED before claim");
            }
        }

        InsuranceClaimEntity entity = new InsuranceClaimEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(policy.getHospitalId());
        entity.setBranchId(policy.getBranchId());
        entity.setPolicyId(policy.getId());
        entity.setPreAuthorizationId(request.getPreAuthorizationId());
        entity.setPatientId(policy.getPatientId());
        entity.setEncounterId(encounterId);
        entity.setAdmissionId(admissionId);
        entity.setInvoiceId(request.getInvoiceId());
        entity.setClaimNumber(allocateNumber("CLM"));
        entity.setStatus("DRAFT");
        entity.setClaimedAmount(request.getClaimedAmount());
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());
        InsuranceClaimEntity saved = claimRepository.save(entity);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "INSURANCE_CLAIM_CREATED",
                "InsuranceClaim", saved.getId(), Map.of("claimNumber", saved.getClaimNumber()));
        return toClaimResponse(saved);
    }

    @Transactional
    public InsuranceClaimResponse submitClaim(UserPrincipal principal, UUID claimId) {
        accessService.assertCanWrite(principal);
        InsuranceClaimEntity entity = requireClaim(principal.getTenantId(), claimId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());
        if (!"DRAFT".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only DRAFT claims can be submitted");
        }
        entity.setStatus("SUBMITTED");
        entity.setSubmittedAt(Instant.now());
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        InsuranceClaimEntity saved = claimRepository.save(entity);

        Map<String, Object> payload = new HashMap<>();
        payload.put("claimNumber", saved.getClaimNumber());
        payload.put("claimedAmount", saved.getClaimedAmount());
        payload.put("invoiceId", saved.getInvoiceId());
        eventPublisher.publish(EventPublisher.PublishRequest.builder()
                .tenantId(principal.getTenantId())
                .hospitalId(saved.getHospitalId())
                .branchId(saved.getBranchId())
                .eventType(HospitalEventTypes.CLAIM_SUBMITTED)
                .patientId(saved.getPatientId())
                .encounterId(saved.getEncounterId())
                .userId(principal.getUserId())
                .entityType("InsuranceClaim")
                .entityId(saved.getId())
                .correlationId(saved.getPolicyId())
                .sourceModule("INSURANCE")
                .payload(payload)
                .build());

        return toClaimResponse(saved);
    }

    @Transactional
    public InsuranceClaimResponse decideClaim(
            UserPrincipal principal, UUID claimId, DecideInsuranceClaimRequest request) {
        accessService.assertCanApprove(principal);
        InsuranceClaimEntity entity = requireClaim(principal.getTenantId(), claimId);
        accessService.assertModuleEnabled(principal, entity.getHospitalId(), entity.getBranchId());

        if (!"SUBMITTED".equals(entity.getStatus()) && !"APPROVED".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Claim must be SUBMITTED (or APPROVED for settle)");
        }

        String decision = request.getDecision() == null ? "" : request.getDecision().trim().toUpperCase(Locale.ROOT);
        if (!Set.of("APPROVED", "REJECTED", "SETTLED").contains(decision)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Decision must be APPROVED, REJECTED, or SETTLED");
        }
        if ("SETTLED".equals(decision) && !"APPROVED".equals(entity.getStatus()) && !"SUBMITTED".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Only submitted/approved claims can be settled");
        }

        Instant now = Instant.now();
        entity.setStatus(decision);
        entity.setDecidedAt(now);
        entity.setNotes(trimToNull(request.getNotes()) != null ? trimToNull(request.getNotes()) : entity.getNotes());
        if ("APPROVED".equals(decision) || "SETTLED".equals(decision)) {
            entity.setApprovedAmount(request.getApprovedAmount() != null
                    ? request.getApprovedAmount()
                    : entity.getClaimedAmount());
        }
        if ("SETTLED".equals(decision)) {
            entity.setSettledAmount(request.getSettledAmount() != null
                    ? request.getSettledAmount()
                    : entity.getApprovedAmount());
            entity.setSettledAt(now);
            if (entity.getApprovedAmount() == null) {
                entity.setApprovedAmount(entity.getSettledAmount());
            }
        }
        entity.setUpdatedBy(principal.getUserId());
        entity.touch();
        InsuranceClaimEntity saved = claimRepository.save(entity);

        taskService.completeOpenTasksForEntity(
                principal.getTenantId(),
                "InsuranceClaim",
                saved.getId(),
                TaskTypes.REVIEW_INSURANCE_CLAIM,
                principal.getUserId());

        if ("SETTLED".equals(decision)) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("claimNumber", saved.getClaimNumber());
            payload.put("settledAmount", saved.getSettledAmount());
            eventPublisher.publish(EventPublisher.PublishRequest.builder()
                    .tenantId(principal.getTenantId())
                    .hospitalId(saved.getHospitalId())
                    .branchId(saved.getBranchId())
                    .eventType(HospitalEventTypes.CLAIM_SETTLED)
                    .patientId(saved.getPatientId())
                    .encounterId(saved.getEncounterId())
                    .userId(principal.getUserId())
                    .entityType("InsuranceClaim")
                    .entityId(saved.getId())
                    .correlationId(saved.getPolicyId())
                    .sourceModule("INSURANCE")
                    .payload(payload)
                    .build());
        }

        return toClaimResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<InsuranceClaimResponse> listClaims(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status, Pageable pageable) {
        accessService.assertCanRead(principal);
        accessService.assertModuleEnabled(principal, hospitalId, branchId);
        Page<InsuranceClaimEntity> page = status != null && !status.isBlank()
                ? claimRepository.findByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, status.trim().toUpperCase(Locale.ROOT), pageable)
                : claimRepository.findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, branchId, pageable);
        return page.map(this::toClaimResponse);
    }

    private InsurancePayerEntity requirePayer(UUID tenantId, UUID payerId) {
        return payerRepository.findByIdAndTenantIdAndDeletedAtIsNull(payerId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Payer not found"));
    }

    private InsurancePolicyEntity requirePolicy(UUID tenantId, UUID policyId) {
        return policyRepository.findByIdAndTenantIdAndDeletedAtIsNull(policyId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Policy not found"));
    }

    private InsurancePreAuthorizationEntity requireAuth(UUID tenantId, UUID authId) {
        return authRepository.findByIdAndTenantIdAndDeletedAtIsNull(authId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Pre-authorization not found"));
    }

    private InsuranceClaimEntity requireClaim(UUID tenantId, UUID claimId) {
        return claimRepository.findByIdAndTenantIdAndDeletedAtIsNull(claimId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Claim not found"));
    }

    private InsurancePayerResponse toPayerResponse(InsurancePayerEntity e) {
        return InsurancePayerResponse.builder()
                .payerId(e.getId())
                .hospitalId(e.getHospitalId())
                .code(e.getCode())
                .name(e.getName())
                .payerType(e.getPayerType())
                .contactPhone(e.getContactPhone())
                .contactEmail(e.getContactEmail())
                .active(e.isActive())
                .notes(e.getNotes())
                .build();
    }

    private InsurancePolicyResponse toPolicyResponse(InsurancePolicyEntity e, InsurancePayerEntity payer) {
        return InsurancePolicyResponse.builder()
                .policyId(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .patientId(e.getPatientId())
                .payerId(e.getPayerId())
                .payerName(payer != null ? payer.getName() : null)
                .policyNumber(e.getPolicyNumber())
                .memberId(e.getMemberId())
                .holderName(e.getHolderName())
                .claimMode(e.getClaimMode())
                .status(e.getStatus())
                .validFrom(e.getValidFrom())
                .validTo(e.getValidTo())
                .coverageLimit(e.getCoverageLimit())
                .notes(e.getNotes())
                .build();
    }

    private PreAuthorizationResponse toAuthResponse(InsurancePreAuthorizationEntity e) {
        return PreAuthorizationResponse.builder()
                .preAuthorizationId(e.getId())
                .policyId(e.getPolicyId())
                .patientId(e.getPatientId())
                .encounterId(e.getEncounterId())
                .admissionId(e.getAdmissionId())
                .authNumber(e.getAuthNumber())
                .authType(e.getAuthType())
                .status(e.getStatus())
                .requestedAmount(e.getRequestedAmount())
                .approvedAmount(e.getApprovedAmount())
                .notes(e.getNotes())
                .decisionNotes(e.getDecisionNotes())
                .requestedAt(e.getRequestedAt())
                .decidedAt(e.getDecidedAt())
                .build();
    }

    private InsuranceClaimResponse toClaimResponse(InsuranceClaimEntity e) {
        return InsuranceClaimResponse.builder()
                .claimId(e.getId())
                .policyId(e.getPolicyId())
                .preAuthorizationId(e.getPreAuthorizationId())
                .patientId(e.getPatientId())
                .encounterId(e.getEncounterId())
                .admissionId(e.getAdmissionId())
                .invoiceId(e.getInvoiceId())
                .claimNumber(e.getClaimNumber())
                .status(e.getStatus())
                .claimedAmount(e.getClaimedAmount())
                .approvedAmount(e.getApprovedAmount())
                .settledAmount(e.getSettledAmount())
                .notes(e.getNotes())
                .submittedAt(e.getSubmittedAt())
                .decidedAt(e.getDecidedAt())
                .settledAt(e.getSettledAt())
                .build();
    }

    private static String allocateNumber(String prefix) {
        int year = LocalDate.now(ZoneId.systemDefault()).getYear();
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return prefix + "-" + year + "-" + suffix;
    }

    private static String normalize(String raw, String defaultValue, Set<String> allowed, String error) {
        if (raw == null || raw.isBlank()) {
            return defaultValue;
        }
        String value = raw.trim().toUpperCase(Locale.ROOT);
        if (!allowed.contains(value)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, error);
        }
        return value;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
