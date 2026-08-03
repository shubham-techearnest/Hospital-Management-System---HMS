package com.health360.hospital.application.service;

import com.health360.doctor.application.service.DocumentStorageService;
import com.health360.hospital.infrastructure.persistence.entity.GalleryImageEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.GalleryImageRepository;
import com.health360.hospital.presentation.dto.response.GalleryImageResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalGalleryService {

    private static final int MAX_IMAGES = 20;

    private final GalleryImageRepository galleryImageRepository;
    private final DocumentStorageService documentStorageService;
    private final HospitalService hospitalService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<GalleryImageResponse> listGallery(UUID adminUserId, UUID tenantId) {
        HospitalEntity hospital = hospitalService.requireHospital(adminUserId, tenantId);
        return galleryImageRepository.findByHospitalIdAndDeletedAtIsNullOrderByDisplayOrderAscCreatedAtAsc(
                        hospital.getId()).stream()
                .map(img -> toResponse(hospital.getId(), img))
                .toList();
    }

    @Transactional
    public GalleryImageResponse uploadImage(
            UUID adminUserId, UUID tenantId, MultipartFile file, String caption, Integer displayOrder) {
        HospitalEntity hospital = hospitalService.requireHospital(adminUserId, tenantId);

        long currentCount = galleryImageRepository.countByHospitalIdAndDeletedAtIsNull(hospital.getId());
        if (currentCount >= MAX_IMAGES) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Gallery cannot exceed " + MAX_IMAGES + " images");
        }

        DocumentStorageService.StoredDocument stored = documentStorageService.storeHospitalGalleryImage(
                tenantId, hospital.getId(), file);

        GalleryImageEntity entity = new GalleryImageEntity();
        entity.setTenantId(tenantId);
        entity.setHospitalId(hospital.getId());
        entity.setS3Key(stored.storageKey());
        entity.setCaption(caption != null ? caption.trim() : null);
        entity.setDisplayOrder(displayOrder != null ? displayOrder : (int) currentCount);
        entity.setFileSizeBytes(stored.fileSizeBytes());
        entity.setMimeType(stored.contentType());
        entity.setCreatedBy(adminUserId);
        entity.setUpdatedBy(adminUserId);
        entity = galleryImageRepository.save(entity);

        auditLogService.record(tenantId, adminUserId, "HOSPITAL_GALLERY_IMAGE_UPLOADED",
                "GalleryImage", entity.getId(), Map.of("hospitalId", hospital.getId().toString()));

        return toResponse(hospital.getId(), entity);
    }

    @Transactional
    public void deleteImage(UUID adminUserId, UUID tenantId, UUID imageId) {
        HospitalEntity hospital = hospitalService.requireHospital(adminUserId, tenantId);
        GalleryImageEntity entity = galleryImageRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(imageId, hospital.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Gallery image not found"));

        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(adminUserId);
        galleryImageRepository.save(entity);
        documentStorageService.delete(entity.getS3Key());
    }

    @Transactional(readOnly = true)
    public List<GalleryImageResponse> listPublicGallery(UUID hospitalId) {
        return galleryImageRepository.findByHospitalIdAndDeletedAtIsNullOrderByDisplayOrderAscCreatedAtAsc(hospitalId)
                .stream()
                .map(img -> toResponse(hospitalId, img))
                .toList();
    }

    @Transactional(readOnly = true)
    public ImageContent viewImage(UUID hospitalId, UUID imageId) {
        GalleryImageEntity entity = galleryImageRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(imageId, hospitalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Gallery image not found"));

        Path path = documentStorageService.resolvePath(entity.getS3Key());
        if (!Files.exists(path)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                    "Gallery image file not found");
        }

        try {
            Resource resource = new UrlResource(path.toUri());
            MediaType mediaType = MediaType.parseMediaType(entity.getMimeType());
            return new ImageContent(resource, mediaType);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to read gallery image");
        }
    }

    public GalleryImageResponse toResponse(UUID hospitalId, GalleryImageEntity entity) {
        return GalleryImageResponse.builder()
                .id(entity.getId())
                .caption(entity.getCaption())
                .displayOrder(entity.getDisplayOrder())
                .fileSizeBytes(entity.getFileSizeBytes())
                .mimeType(entity.getMimeType())
                .imageUrl("/api/v1/hospitals/" + hospitalId + "/gallery/" + entity.getId() + "/view")
                .build();
    }

    public record ImageContent(Resource resource, MediaType contentType) {
    }
}
