package com.health360.review.application.service;

import com.health360.patient.application.service.HealthTimelineService;
import com.health360.patient.application.service.PatientProfileService;
import com.health360.patient.domain.HealthTimelineEventType;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.review.infrastructure.persistence.entity.DoctorReviewEntity;
import com.health360.review.infrastructure.persistence.entity.HospitalReviewEntity;
import com.health360.review.infrastructure.persistence.repository.DoctorReviewRepository;
import com.health360.review.infrastructure.persistence.repository.HospitalReviewRepository;
import com.health360.review.presentation.dto.request.SubmitReviewRequest;
import com.health360.review.presentation.dto.response.SubmitReviewResponse;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewCommandService {

    private static final int REVIEW_WINDOW_DAYS = 30;

    private final DoctorReviewRepository doctorReviewRepository;
    private final HospitalReviewRepository hospitalReviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientProfileService patientProfileService;
    private final RatingAggregationService ratingAggregationService;
    private final HealthTimelineService healthTimelineService;
    private final AuditLogService auditLogService;

    @Transactional
    public SubmitReviewResponse submitDoctorReview(UUID userId, UUID tenantId, SubmitReviewRequest request) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        AppointmentEntity appointment = requireReviewableAppointment(profile.getId(), tenantId, request);

        if (doctorReviewRepository.existsByAppointmentId(appointment.getId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_REVIEW, HttpStatus.CONFLICT,
                    "A review already exists for this appointment");
        }

        DoctorReviewEntity review = new DoctorReviewEntity();
        review.setTenantId(tenantId);
        review.setDoctorId(appointment.getDoctorId());
        review.setPatientId(profile.getId());
        review.setAppointmentId(appointment.getId());
        review.setRating(request.getRating());
        review.setComment(trimComment(request.getComment()));
        review.setCreatedBy(userId);
        review.setUpdatedBy(userId);
        review = doctorReviewRepository.save(review);

        ratingAggregationService.recalculateDoctorRating(appointment.getDoctorId());
        recordReviewTimeline(tenantId, profile.getId(), review.getId(), request.getRating());
        auditLogService.record(tenantId, userId, "DOCTOR_REVIEW_SUBMITTED", "DoctorReview",
                review.getId(), Map.of("appointmentId", appointment.getId().toString()));

        return toResponse(review.getId(), appointment.getId(), review.getRating(),
                review.getComment(), review.getCreatedAt());
    }

    @Transactional
    public SubmitReviewResponse submitHospitalReview(UUID userId, UUID tenantId, SubmitReviewRequest request) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        AppointmentEntity appointment = requireReviewableAppointment(profile.getId(), tenantId, request);

        if (hospitalReviewRepository.existsByAppointmentId(appointment.getId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_REVIEW, HttpStatus.CONFLICT,
                    "A review already exists for this appointment");
        }

        HospitalReviewEntity review = new HospitalReviewEntity();
        review.setTenantId(tenantId);
        review.setHospitalId(appointment.getHospitalId());
        review.setPatientId(profile.getId());
        review.setAppointmentId(appointment.getId());
        review.setRating(request.getRating());
        review.setComment(trimComment(request.getComment()));
        review.setCreatedBy(userId);
        review.setUpdatedBy(userId);
        review = hospitalReviewRepository.save(review);

        ratingAggregationService.recalculateHospitalRating(appointment.getHospitalId());
        recordReviewTimeline(tenantId, profile.getId(), review.getId(), request.getRating());
        auditLogService.record(tenantId, userId, "HOSPITAL_REVIEW_SUBMITTED", "HospitalReview",
                review.getId(), Map.of("appointmentId", appointment.getId().toString()));

        return toResponse(review.getId(), appointment.getId(), review.getRating(),
                review.getComment(), review.getCreatedAt());
    }

    private AppointmentEntity requireReviewableAppointment(
            UUID patientId, UUID tenantId, SubmitReviewRequest request) {
        AppointmentEntity appointment = appointmentRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getAppointmentId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Appointment not found"));

        if (!appointment.getPatientId().equals(patientId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                    "You can only review your own appointments");
        }
        if (!"COMPLETED".equals(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Only completed appointments can be reviewed");
        }

        Instant completedAt = appointment.getCompletedAt() != null
                ? appointment.getCompletedAt()
                : appointment.getScheduledAt();
        Instant windowEnd = completedAt.plus(REVIEW_WINDOW_DAYS, ChronoUnit.DAYS);
        if (Instant.now().isAfter(windowEnd)) {
            throw new BusinessException(ErrorCode.REVIEW_WINDOW_CLOSED, HttpStatus.BAD_REQUEST,
                    "Review window has closed for this appointment");
        }

        return appointment;
    }

    private void recordReviewTimeline(UUID tenantId, UUID patientId, UUID reviewId, int rating) {
        healthTimelineService.recordEvent(
                tenantId,
                patientId,
                HealthTimelineEventType.REVIEW_SUBMITTED,
                "Review submitted (" + rating + " stars)",
                "Review",
                reviewId,
                Instant.now(),
                Map.of("rating", rating));
    }

    private String trimComment(String comment) {
        return comment != null && !comment.isBlank() ? comment.trim() : null;
    }

    private SubmitReviewResponse toResponse(
            UUID id, UUID appointmentId, int rating, String comment, Instant createdAt) {
        return SubmitReviewResponse.builder()
                .id(id)
                .appointmentId(appointmentId)
                .rating(rating)
                .comment(comment)
                .createdAt(createdAt)
                .build();
    }
}
