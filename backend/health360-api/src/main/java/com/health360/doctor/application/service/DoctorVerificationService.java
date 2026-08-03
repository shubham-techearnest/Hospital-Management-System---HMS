package com.health360.doctor.application.service;

import com.health360.doctor.infrastructure.persistence.entity.DoctorLanguageEntity;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.VerificationDocumentEntity;
import com.health360.doctor.infrastructure.persistence.repository.*;
import com.health360.doctor.presentation.dto.request.LanguageRequest;
import com.health360.doctor.presentation.dto.response.DoctorProfileResponse;
import com.health360.doctor.presentation.dto.response.VerificationDocumentResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorVerificationService {

    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of("REGISTRATION_CERT", "IDENTITY_PROOF");
    private static final Set<String> SUPPORTED_LANGUAGES = Set.of(
            "en", "hi", "mr", "ta", "te", "bn", "gu", "kn", "ml", "pa"
    );

    private final DoctorProfileRepository profileRepository;
    private final QualificationRepository qualificationRepository;
    private final DoctorLanguageRepository languageRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final DocumentStorageService documentStorageService;
    private final DoctorProfileService doctorProfileService;
    private final DoctorProfileProvisioningService profileProvisioningService;
    private final DoctorProfileMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public DoctorProfileResponse addLanguage(UUID userId, UUID tenantId, LanguageRequest request) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        String code = request.getLanguageCode().toLowerCase();
        if (!SUPPORTED_LANGUAGES.contains(code)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Unsupported language code: " + code);
        }
        if (languageRepository.existsByDoctorIdAndLanguageCode(profile.getId(), code)) {
            return doctorProfileService.getProfile(userId, tenantId);
        }

        DoctorLanguageEntity entity = new DoctorLanguageEntity();
        entity.setDoctorId(profile.getId());
        entity.setLanguageCode(code);
        languageRepository.save(entity);

        auditLogService.record(tenantId, userId, "DOCTOR_LANGUAGE_ADDED",
                "DoctorProfile", profile.getId(), Map.of("languageCode", code));

        return doctorProfileService.getProfile(userId, tenantId);
    }

    @Transactional
    public DoctorProfileResponse removeLanguage(UUID userId, UUID tenantId, String languageCode) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        languageRepository.deleteByDoctorIdAndLanguageCode(profile.getId(), languageCode.toLowerCase());
        return doctorProfileService.getProfile(userId, tenantId);
    }

    @Transactional(readOnly = true)
    public List<VerificationDocumentResponse> listDocuments(UUID userId, UUID tenantId) {
        DoctorProfileEntity profile = profileProvisioningService.ensureProfileEntity(userId, tenantId);
        return verificationDocumentRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByUploadedAtDesc(profile.getId()).stream()
                .map(mapper::toVerificationDocumentResponse)
                .toList();
    }

    @Transactional
    public VerificationDocumentResponse uploadDocument(
            UUID userId, UUID tenantId, String documentType, MultipartFile file) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        String normalizedType = normalizeDocumentType(documentType);

        verificationDocumentRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByUploadedAtDesc(profile.getId()).stream()
                .filter(d -> normalizedType.equals(d.getDocumentType()))
                .forEach(existing -> softDeleteDocument(existing, userId));

        DocumentStorageService.StoredDocument stored = documentStorageService.store(
                tenantId, profile.getId(), normalizedType, file);

        VerificationDocumentEntity entity = new VerificationDocumentEntity();
        entity.setTenantId(tenantId);
        entity.setDoctorId(profile.getId());
        entity.setDocumentType(normalizedType);
        entity.setStorageKey(stored.storageKey());
        entity.setFileName(stored.fileName());
        entity.setContentType(stored.contentType());
        entity.setFileSizeBytes(stored.fileSizeBytes());
        entity.setUploadedAt(Instant.now());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        entity = verificationDocumentRepository.save(entity);

        auditLogService.record(tenantId, userId, "DOCTOR_VERIFICATION_DOCUMENT_UPLOADED",
                "VerificationDocument", entity.getId(), Map.of("documentType", normalizedType));

        return mapper.toVerificationDocumentResponse(entity);
    }

    @Transactional
    public void deleteDocument(UUID userId, UUID tenantId, UUID documentId) {
        DoctorProfileEntity profile = requireEditableProfile(userId, tenantId);
        VerificationDocumentEntity entity = verificationDocumentRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(documentId, profile.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Document not found"));

        softDeleteDocument(entity, userId);
    }

    @Transactional
    public DoctorProfileResponse submitForVerification(UUID userId, UUID tenantId) {
        DoctorProfileEntity profile = profileProvisioningService.ensureProfileEntity(userId, tenantId);
        String status = profile.getVerificationStatus();
        if (!"DRAFT".equals(status) && !"REJECTED".equals(status)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Profile cannot be submitted in current status: " + status);
        }

        List<BusinessException.FieldErrorDetail> missing = validateSubmissionRequirements(profile);
        if (!missing.isEmpty()) {
            throw new BusinessException(ErrorCode.VERIFICATION_INCOMPLETE, HttpStatus.UNPROCESSABLE_ENTITY,
                    "Profile is incomplete for verification submission", missing);
        }

        profile.setVerificationStatus("PENDING_VERIFICATION");
        profile.setVerificationRejectionReason(null);
        profile.setSubmittedAt(Instant.now());
        profile.setUpdatedBy(userId);
        profile.touch();
        profileRepository.save(profile);

        auditLogService.record(tenantId, userId, "DOCTOR_VERIFICATION_SUBMITTED",
                "DoctorProfile", profile.getId(), Map.of());

        return doctorProfileService.getProfile(userId, tenantId);
    }

    private List<BusinessException.FieldErrorDetail> validateSubmissionRequirements(DoctorProfileEntity profile) {
        List<BusinessException.FieldErrorDetail> missing = new ArrayList<>();

        if (profile.getMedicalRegistrationNumber() == null || profile.getMedicalRegistrationNumber().isBlank()) {
            missing.add(field("medicalRegistrationNumber", "Medical registration number is required"));
        }
        if (profile.getPrimarySpecializationId() == null) {
            missing.add(field("primarySpecialization", "Primary specialization is required"));
        }
        if (qualificationRepository.findByDoctorIdAndDeletedAtIsNullOrderByYearOfCompletionDesc(profile.getId()).isEmpty()) {
            missing.add(field("qualifications", "At least one qualification is required"));
        }
        if (!verificationDocumentRepository.existsByDoctorIdAndDocumentTypeAndDeletedAtIsNull(
                profile.getId(), "REGISTRATION_CERT")) {
            missing.add(field("registrationCertificate", "Registration certificate document is required"));
        }
        if (!verificationDocumentRepository.existsByDoctorIdAndDocumentTypeAndDeletedAtIsNull(
                profile.getId(), "IDENTITY_PROOF")) {
            missing.add(field("identityProof", "Identity proof document is required"));
        }

        return missing;
    }

    private BusinessException.FieldErrorDetail field(String field, String message) {
        return new BusinessException.FieldErrorDetail(field, message, "REQUIRED");
    }

    private void softDeleteDocument(VerificationDocumentEntity entity, UUID userId) {
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        verificationDocumentRepository.save(entity);
        documentStorageService.delete(entity.getStorageKey());
    }

    private String normalizeDocumentType(String documentType) {
        if (documentType == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Document type is required");
        }
        String normalized = documentType.trim().toUpperCase();
        if (!ALLOWED_DOCUMENT_TYPES.contains(normalized)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid document type: " + documentType);
        }
        return normalized;
    }

    private DoctorProfileEntity requireEditableProfile(UUID userId, UUID tenantId) {
        DoctorProfileEntity profile = profileProvisioningService.ensureProfileEntity(userId, tenantId);
        if (!"DRAFT".equals(profile.getVerificationStatus())
                && !"REJECTED".equals(profile.getVerificationStatus())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "Profile cannot be edited in current verification status");
        }
        return profile;
    }
}
