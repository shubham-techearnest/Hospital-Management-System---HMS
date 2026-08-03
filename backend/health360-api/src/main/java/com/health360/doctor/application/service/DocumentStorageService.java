package com.health360.doctor.application.service;

import com.health360.config.Health360Properties;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentStorageService {

    private static final long PATIENT_DOCUMENT_MAX_BYTES = 10L * 1024 * 1024;
    private static final long GALLERY_IMAGE_MAX_BYTES = 5L * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png"
    );

    private static final Set<String> PATIENT_ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/dicom"
    );

    private static final Set<String> GALLERY_ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png"
    );

    private final Health360Properties properties;

    public StoredDocument store(UUID tenantId, UUID doctorId, String documentType, MultipartFile file) {
        validateFile(file, properties.getStorage().getMaxFileSizeBytes(), ALLOWED_CONTENT_TYPES,
                "File exceeds maximum size of 5 MB", "File type not allowed. Use PDF, JPEG, or PNG");

        String extension = extensionFor(file.getOriginalFilename(), file.getContentType());
        String storageKey = tenantId + "/doctors/" + doctorId + "/verification/"
                + documentType + "/" + UUID.randomUUID() + extension;

        return storeFile(storageKey, file);
    }

    public StoredDocument storePatientDocument(
            UUID tenantId, UUID patientId, String category, MultipartFile file) {
        validateFile(file, PATIENT_DOCUMENT_MAX_BYTES, PATIENT_ALLOWED_CONTENT_TYPES,
                "File exceeds maximum size of 10 MB",
                "File type not allowed. Use PDF, JPEG, PNG, or DICOM");

        String extension = extensionFor(file.getOriginalFilename(), file.getContentType());
        String storageKey = tenantId + "/patients/" + patientId + "/documents/"
                + category + "/" + UUID.randomUUID() + extension;

        return storeFile(storageKey, file);
    }

    public StoredDocument storeHospitalGalleryImage(UUID tenantId, UUID hospitalId, MultipartFile file) {
        validateFile(file, GALLERY_IMAGE_MAX_BYTES, GALLERY_ALLOWED_CONTENT_TYPES,
                "File exceeds maximum size of 5 MB",
                "File type not allowed. Use JPEG or PNG");

        String extension = extensionFor(file.getOriginalFilename(), file.getContentType());
        String storageKey = tenantId + "/hospitals/" + hospitalId + "/gallery/"
                + UUID.randomUUID() + extension;

        return storeFile(storageKey, file);
    }

    private StoredDocument storeFile(String storageKey, MultipartFile file) {
        Path target = resolvePath(storageKey);
        try {
            Files.createDirectories(target.getParent());
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store document");
        }

        return new StoredDocument(
                storageKey,
                sanitizeFileName(file.getOriginalFilename()),
                file.getContentType(),
                file.getSize()
        );
    }

    public Path resolvePath(String storageKey) {
        return Path.of(properties.getStorage().getLocalBasePath()).resolve(storageKey).normalize();
    }

    public void delete(String storageKey) {
        try {
            Files.deleteIfExists(resolvePath(storageKey));
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to delete document file");
        }
    }

    private void validateFile(
            MultipartFile file,
            long maxSizeBytes,
            Set<String> allowedContentTypes,
            String sizeMessage,
            String typeMessage) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "File is required");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new BusinessException(ErrorCode.FILE_TOO_LARGE, HttpStatus.PAYLOAD_TOO_LARGE, sizeMessage);
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedContentTypes.contains(contentType)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, typeMessage);
        }
    }

    private String sanitizeFileName(String original) {
        if (original == null || original.isBlank()) {
            return "document";
        }
        return original.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String extensionFor(String fileName, String contentType) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf('.'));
        }
        return switch (contentType) {
            case "application/pdf" -> ".pdf";
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "application/dicom" -> ".dcm";
            default -> "";
        };
    }

    public record StoredDocument(String storageKey, String fileName, String contentType, long fileSizeBytes) {
    }
}
