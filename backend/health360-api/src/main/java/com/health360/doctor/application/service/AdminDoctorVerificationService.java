package com.health360.doctor.application.service;

import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.VerificationDocumentEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.doctor.infrastructure.persistence.repository.VerificationDocumentRepository;
import com.health360.doctor.presentation.dto.request.RejectVerificationRequest;
import com.health360.doctor.presentation.dto.response.DoctorProfileResponse;
import com.health360.doctor.presentation.dto.response.PendingVerificationResponse;
import com.health360.doctor.presentation.dto.response.VerificationDocumentResponse;
import com.health360.doctor.presentation.dto.response.VerificationReviewResponse;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDoctorVerificationService {

    private final DoctorProfileRepository profileRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final UserRepository userRepository;
    private final DoctorProfileService doctorProfileService;
    private final DoctorProfileMapper mapper;
    private final DocumentStorageService documentStorageService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<PendingVerificationResponse> listPending(UUID tenantId, String status, Pageable pageable) {
        String filterStatus = status != null && !status.isBlank() ? status : "PENDING_VERIFICATION";
        Page<DoctorProfileEntity> page = profileRepository
                .findByTenantIdAndVerificationStatusAndDeletedAtIsNull(tenantId, filterStatus, pageable);

        Map<UUID, UserEntity> usersById = userRepository.findAllById(
                page.getContent().stream().map(DoctorProfileEntity::getUserId).toList()).stream()
                .collect(Collectors.toMap(UserEntity::getId, Function.identity()));

        return page.map(profile -> {
            UserEntity user = usersById.get(profile.getUserId());
            String name = user != null ? user.getFirstName() + " " + user.getLastName() : "Unknown";
            return PendingVerificationResponse.builder()
                    .doctorId(profile.getId())
                    .userId(profile.getUserId())
                    .doctorName(name)
                    .medicalRegistrationNumber(profile.getMedicalRegistrationNumber())
                    .verificationStatus(profile.getVerificationStatus())
                    .submittedAt(profile.getSubmittedAt())
                    .build();
        });
    }

    @Transactional(readOnly = true)
    public VerificationReviewResponse getReviewDetail(UUID tenantId, UUID doctorId) {
        DoctorProfileEntity profile = requireDoctor(tenantId, doctorId);
        UserEntity user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Doctor user not found"));

        DoctorProfileResponse fullProfile = doctorProfileService.getProfile(profile.getUserId(), tenantId);
        List<VerificationDocumentResponse> documents = verificationDocumentRepository
                .findByDoctorIdAndDeletedAtIsNullOrderByUploadedAtDesc(profile.getId()).stream()
                .map(mapper::toVerificationDocumentResponse)
                .toList();

        return VerificationReviewResponse.builder()
                .doctorId(profile.getId())
                .userId(profile.getUserId())
                .doctorName(user.getFirstName() + " " + user.getLastName())
                .email(user.getEmail())
                .verificationStatus(profile.getVerificationStatus())
                .submittedAt(profile.getSubmittedAt())
                .rejectionReason(profile.getVerificationRejectionReason())
                .profile(fullProfile)
                .documents(documents)
                .build();
    }

    @Transactional
    public VerificationReviewResponse approve(UUID tenantId, UUID adminUserId, UUID doctorId) {
        DoctorProfileEntity profile = requireDoctor(tenantId, doctorId);
        if (!"PENDING_VERIFICATION".equals(profile.getVerificationStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Doctor is not pending verification");
        }

        profile.setVerificationStatus("VERIFIED");
        profile.setVerificationRejectionReason(null);
        profile.setVerifiedAt(Instant.now());
        profile.setVerifiedBy(adminUserId);
        profile.setUpdatedBy(adminUserId);
        profile.touch();
        profileRepository.save(profile);

        auditLogService.record(tenantId, adminUserId, "DOCTOR_VERIFICATION_APPROVED",
                "DoctorProfile", profile.getId(), Map.of("doctorUserId", profile.getUserId()));

        return getReviewDetail(tenantId, doctorId);
    }

    @Transactional
    public VerificationReviewResponse reject(
            UUID tenantId, UUID adminUserId, UUID doctorId, RejectVerificationRequest request) {
        DoctorProfileEntity profile = requireDoctor(tenantId, doctorId);
        if (!"PENDING_VERIFICATION".equals(profile.getVerificationStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Doctor is not pending verification");
        }

        profile.setVerificationStatus("REJECTED");
        profile.setVerificationRejectionReason(request.getReason());
        profile.setVerifiedAt(null);
        profile.setVerifiedBy(null);
        profile.setUpdatedBy(adminUserId);
        profile.touch();
        profileRepository.save(profile);

        auditLogService.record(tenantId, adminUserId, "DOCTOR_VERIFICATION_REJECTED",
                "DoctorProfile", profile.getId(), Map.of("reason", request.getReason()));

        return getReviewDetail(tenantId, doctorId);
    }

    @Transactional(readOnly = true)
    public DocumentContent getDocumentContent(UUID tenantId, UUID doctorId, UUID documentId) {
        requireDoctor(tenantId, doctorId);
        VerificationDocumentEntity entity = verificationDocumentRepository
                .findByIdAndDoctorIdAndDeletedAtIsNull(documentId, doctorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Document not found"));

        Path path = documentStorageService.resolvePath(entity.getStorageKey());
        if (!Files.exists(path)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                    "Document file not found");
        }

        try {
            Resource resource = new UrlResource(path.toUri());
            MediaType mediaType = MediaType.parseMediaType(entity.getContentType());
            return new DocumentContent(resource, entity.getFileName(), mediaType);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to read document");
        }
    }

    private DoctorProfileEntity requireDoctor(UUID tenantId, UUID doctorId) {
        return profileRepository.findByIdAndTenantIdAndDeletedAtIsNull(doctorId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Doctor profile not found"));
    }

    public record DocumentContent(Resource resource, String fileName, MediaType contentType) {
    }
}
