package com.health360.review.application.service;

import com.health360.review.infrastructure.persistence.entity.DoctorReviewEntity;
import com.health360.review.infrastructure.persistence.entity.HospitalReviewEntity;
import com.health360.review.infrastructure.persistence.repository.DoctorReviewRepository;
import com.health360.review.infrastructure.persistence.repository.HospitalReviewRepository;
import com.health360.review.presentation.dto.request.ModerateReviewRequest;
import com.health360.review.presentation.dto.response.AdminReviewResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminReviewModerationService {

    private final DoctorReviewRepository doctorReviewRepository;
    private final HospitalReviewRepository hospitalReviewRepository;
    private final RatingAggregationService ratingAggregationService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<AdminReviewResponse> listReviews(UUID tenantId, String status, Pageable pageable) {
        boolean visible = !"hidden".equalsIgnoreCase(status);
        int needed = (pageable.getPageNumber() + 1) * pageable.getPageSize();
        Pageable fetchPage = PageRequest.of(0, needed, pageable.getSort());

        List<AdminReviewResponse> combined = new ArrayList<>();
        doctorReviewRepository
                .findByTenantIdAndVisibleAndDeletedAtIsNullOrderByCreatedAtDesc(tenantId, visible, fetchPage)
                .forEach(review -> combined.add(toDoctorReview(review)));
        hospitalReviewRepository
                .findByTenantIdAndVisibleAndDeletedAtIsNullOrderByCreatedAtDesc(tenantId, visible, fetchPage)
                .forEach(review -> combined.add(toHospitalReview(review)));
        combined.sort(Comparator.comparing(AdminReviewResponse::getCreatedAt).reversed());

        int start = pageable.getPageNumber() * pageable.getPageSize();
        int end = Math.min(start + pageable.getPageSize(), combined.size());
        List<AdminReviewResponse> pageContent = start >= combined.size()
                ? List.of()
                : combined.subList(start, end);

        long total = doctorReviewRepository.countByTenantIdAndVisibleAndDeletedAtIsNull(tenantId, visible)
                + hospitalReviewRepository.countByTenantIdAndVisibleAndDeletedAtIsNull(tenantId, visible);
        return new PageImpl<>(pageContent, pageable, total);
    }

    @Transactional
    public AdminReviewResponse moderateReview(
            UUID tenantId, UUID adminUserId, UUID reviewId, ModerateReviewRequest request) {
        DoctorReviewEntity doctorReview = doctorReviewRepository.findById(reviewId)
                .filter(r -> r.getTenantId().equals(tenantId))
                .orElse(null);
        if (doctorReview != null) {
            applyModeration(doctorReview, adminUserId, request);
            doctorReviewRepository.save(doctorReview);
            ratingAggregationService.recalculateDoctorRating(doctorReview.getDoctorId());
            auditModeration(tenantId, adminUserId, reviewId, "DoctorReview", request);
            return toDoctorReview(doctorReview);
        }

        HospitalReviewEntity hospitalReview = hospitalReviewRepository.findById(reviewId)
                .filter(r -> r.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Review not found"));

        applyModeration(hospitalReview, adminUserId, request);
        hospitalReviewRepository.save(hospitalReview);
        ratingAggregationService.recalculateHospitalRating(hospitalReview.getHospitalId());
        auditModeration(tenantId, adminUserId, reviewId, "HospitalReview", request);
        return toHospitalReview(hospitalReview);
    }

    private void applyModeration(
            DoctorReviewEntity review, UUID adminUserId, ModerateReviewRequest request) {
        review.setModeratedBy(adminUserId);
        review.setModeratedAt(Instant.now());
        review.setUpdatedBy(adminUserId);
        if ("HIDE".equals(request.getAction())) {
            review.setVisible(false);
        } else if ("REMOVE".equals(request.getAction())) {
            review.setVisible(false);
            review.setDeletedAt(Instant.now());
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid moderation action");
        }
    }

    private void applyModeration(
            HospitalReviewEntity review, UUID adminUserId, ModerateReviewRequest request) {
        review.setModeratedBy(adminUserId);
        review.setModeratedAt(Instant.now());
        review.setUpdatedBy(adminUserId);
        if ("HIDE".equals(request.getAction())) {
            review.setVisible(false);
        } else if ("REMOVE".equals(request.getAction())) {
            review.setVisible(false);
            review.setDeletedAt(Instant.now());
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid moderation action");
        }
    }

    private void auditModeration(
            UUID tenantId, UUID adminUserId, UUID reviewId, String entityType, ModerateReviewRequest request) {
        auditLogService.record(tenantId, adminUserId, "REVIEW_MODERATED", entityType, reviewId,
                Map.of("action", request.getAction(), "reason", request.getReason()));
    }

    private AdminReviewResponse toDoctorReview(DoctorReviewEntity review) {
        return AdminReviewResponse.builder()
                .id(review.getId())
                .reviewType("DOCTOR")
                .targetId(review.getDoctorId())
                .patientId(review.getPatientId())
                .appointmentId(review.getAppointmentId())
                .rating(review.getRating())
                .comment(review.getComment())
                .visible(review.isVisible())
                .createdAt(review.getCreatedAt())
                .moderatedAt(review.getModeratedAt())
                .build();
    }

    private AdminReviewResponse toHospitalReview(HospitalReviewEntity review) {
        return AdminReviewResponse.builder()
                .id(review.getId())
                .reviewType("HOSPITAL")
                .targetId(review.getHospitalId())
                .patientId(review.getPatientId())
                .appointmentId(review.getAppointmentId())
                .rating(review.getRating())
                .comment(review.getComment())
                .visible(review.isVisible())
                .createdAt(review.getCreatedAt())
                .moderatedAt(review.getModeratedAt())
                .build();
    }
}
