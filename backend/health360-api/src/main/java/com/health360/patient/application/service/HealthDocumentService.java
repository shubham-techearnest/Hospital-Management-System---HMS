package com.health360.patient.application.service;

import com.health360.doctor.application.service.DocumentStorageService;
import com.health360.patient.domain.HealthTimelineEventType;
import com.health360.patient.infrastructure.persistence.entity.HealthDocumentEntity;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.HealthDocumentRepository;
import com.health360.patient.presentation.dto.response.HealthDocumentResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HealthDocumentService {

    private static final Set<String> ALLOWED_CATEGORIES = Set.of(
            "LAB_REPORT", "PRESCRIPTION", "SCAN", "OTHER");

    private final HealthDocumentRepository healthDocumentRepository;
    private final DocumentStorageService documentStorageService;
    private final PatientProfileService patientProfileService;
    private final HealthTimelineService healthTimelineService;
    private final AuditLogService auditLogService;

    @Transactional
    public HealthDocumentResponse uploadDocument(
            UUID userId,
            UUID tenantId,
            MultipartFile file,
            String category,
            String title,
            String description) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        validateCategory(category);
        if (title == null || title.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Title is required");
        }

        DocumentStorageService.StoredDocument stored = documentStorageService.storePatientDocument(
                tenantId, profile.getId(), category.trim().toUpperCase(), file);

        HealthDocumentEntity entity = new HealthDocumentEntity();
        entity.setTenantId(tenantId);
        entity.setPatientId(profile.getId());
        entity.setFileName(stored.fileName());
        entity.setS3Key(stored.storageKey());
        entity.setFileSizeBytes(stored.fileSizeBytes());
        entity.setMimeType(stored.contentType());
        entity.setCategory(category.trim().toUpperCase());
        entity.setTitle(title.trim());
        entity.setDescription(description != null ? description.trim() : null);
        entity.setUploadedAt(Instant.now());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        healthDocumentRepository.save(entity);

        healthTimelineService.recordEvent(
                tenantId,
                profile.getId(),
                HealthTimelineEventType.DOCUMENT_UPLOADED,
                "Health document uploaded: " + entity.getTitle(),
                "HealthDocument",
                entity.getId(),
                entity.getUploadedAt(),
                Map.of("category", entity.getCategory(), "fileName", entity.getFileName()));

        auditLogService.record(tenantId, userId, "HEALTH_DOCUMENT_UPLOADED", "HealthDocument",
                entity.getId(), Map.of("category", entity.getCategory()));

        return toResponse(entity);
    }

    @Transactional(readOnly = true)
    public Page<HealthDocumentResponse> listDocuments(
            UUID userId, UUID tenantId, String category, Pageable pageable) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        Page<HealthDocumentEntity> page;
        if (category != null && !category.isBlank()) {
            page = healthDocumentRepository.findByPatientIdAndCategoryAndDeletedAtIsNullOrderByUploadedAtDesc(
                    profile.getId(), category.trim().toUpperCase(), pageable);
        } else {
            page = healthDocumentRepository.findByPatientIdAndDeletedAtIsNullOrderByUploadedAtDesc(
                    profile.getId(), pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DocumentContent downloadDocument(UUID userId, UUID tenantId, UUID documentId) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        HealthDocumentEntity entity = requireDocument(profile.getId(), documentId);

        Path path = documentStorageService.resolvePath(entity.getS3Key());
        if (!Files.exists(path)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                    "Document file not found");
        }

        try {
            Resource resource = new UrlResource(path.toUri());
            MediaType mediaType = MediaType.parseMediaType(entity.getMimeType());
            return new DocumentContent(resource, entity.getFileName(), mediaType);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to read document");
        }
    }

    @Transactional
    public void deleteDocument(UUID userId, UUID tenantId, UUID documentId) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        HealthDocumentEntity entity = requireDocument(profile.getId(), documentId);
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        healthDocumentRepository.save(entity);
    }

    private HealthDocumentEntity requireDocument(UUID patientId, UUID documentId) {
        return healthDocumentRepository.findByIdAndPatientIdAndDeletedAtIsNull(documentId, patientId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Document not found"));
    }

    private void validateCategory(String category) {
        if (category == null || category.isBlank()
                || !ALLOWED_CATEGORIES.contains(category.trim().toUpperCase())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid document category");
        }
    }

    private HealthDocumentResponse toResponse(HealthDocumentEntity entity) {
        return HealthDocumentResponse.builder()
                .id(entity.getId())
                .fileName(entity.getFileName())
                .category(entity.getCategory())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .fileSizeBytes(entity.getFileSizeBytes())
                .mimeType(entity.getMimeType())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }

    public record DocumentContent(Resource resource, String fileName, MediaType contentType) {
    }
}
