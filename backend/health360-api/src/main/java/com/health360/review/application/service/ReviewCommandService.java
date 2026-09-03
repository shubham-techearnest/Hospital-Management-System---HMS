package com.health360.review.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
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
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewCommandService {

    private static final int REVIEW_WINDOW_DAYS = 30;

    private final DoctorReviewRepository doctorReviewRepository;
    private final HospitalReviewRepository hospitalReviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final EncounterRepository encounterRepository;
    private final PatientProfileService patientProfileService;
    private final RatingAggregationService ratingAggregationService;
    private final HealthTimelineService healthTimelineService;
    private final AuditLogService auditLogService;

    @Transactional
    public SubmitReviewResponse submitDoctorReview(UUID userId, UUID tenantId, SubmitReviewRequest request) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        ReviewVisitContext visit = requireReviewableVisit(profile.getId(), tenantId, request);

        if (visit.doctorId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "This visit has no assigned doctor to review");
        }
        assertNoDuplicateDoctorReview(visit);

        DoctorReviewEntity review = new DoctorReviewEntity();
        review.setTenantId(tenantId);
        review.setDoctorId(visit.doctorId());
        review.setPatientId(profile.getId());
        review.setAppointmentId(visit.appointmentId());
        review.setEncounterId(visit.encounterId());
        review.setRating(request.getRating());
        review.setComment(trimComment(request.getComment()));
        review.setCreatedBy(userId);
        review.setUpdatedBy(userId);
        review = doctorReviewRepository.save(review);

        ratingAggregationService.recalculateDoctorRating(visit.doctorId());
        recordReviewTimeline(tenantId, profile.getId(), review.getId(), request.getRating());
        auditLogService.record(tenantId, userId, "DOCTOR_REVIEW_SUBMITTED", "DoctorReview",
                review.getId(), auditDetails(visit));

        return toResponse(review.getId(), visit.appointmentId(), visit.encounterId(),
                review.getRating(), review.getComment(), review.getCreatedAt());
    }

    @Transactional
    public SubmitReviewResponse submitHospitalReview(UUID userId, UUID tenantId, SubmitReviewRequest request) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        ReviewVisitContext visit = requireReviewableVisit(profile.getId(), tenantId, request);

        assertNoDuplicateHospitalReview(visit);

        HospitalReviewEntity review = new HospitalReviewEntity();
        review.setTenantId(tenantId);
        review.setHospitalId(visit.hospitalId());
        review.setPatientId(profile.getId());
        review.setAppointmentId(visit.appointmentId());
        review.setEncounterId(visit.encounterId());
        review.setRating(request.getRating());
        review.setComment(trimComment(request.getComment()));
        review.setCreatedBy(userId);
        review.setUpdatedBy(userId);
        review = hospitalReviewRepository.save(review);

        ratingAggregationService.recalculateHospitalRating(visit.hospitalId());
        recordReviewTimeline(tenantId, profile.getId(), review.getId(), request.getRating());
        auditLogService.record(tenantId, userId, "HOSPITAL_REVIEW_SUBMITTED", "HospitalReview",
                review.getId(), auditDetails(visit));

        return toResponse(review.getId(), visit.appointmentId(), visit.encounterId(),
                review.getRating(), review.getComment(), review.getCreatedAt());
    }

    private ReviewVisitContext requireReviewableVisit(
            UUID patientId, UUID tenantId, SubmitReviewRequest request) {
        if (request.getAppointmentId() == null && request.getEncounterId() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Provide appointmentId or encounterId");
        }

        AppointmentEntity appointment = null;
        EncounterEntity encounter = null;

        if (request.getEncounterId() != null) {
            encounter = encounterRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(request.getEncounterId(), tenantId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Encounter not found"));
            if (!encounter.getPatientId().equals(patientId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                        "You can only review your own visits");
            }
            if (!"COMPLETED".equals(encounter.getStatus())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Only completed visits can be reviewed");
            }
            assertWithinReviewWindow(completedAtForEncounter(encounter), "visit");

            if (encounter.getAppointmentId() != null) {
                appointment = appointmentRepository
                        .findByIdAndTenantIdAndDeletedAtIsNull(encounter.getAppointmentId(), tenantId)
                        .orElse(null);
            }
        }

        if (request.getAppointmentId() != null) {
            AppointmentEntity requestedAppointment = appointmentRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(request.getAppointmentId(), tenantId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Appointment not found"));
            if (!requestedAppointment.getPatientId().equals(patientId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                        "You can only review your own appointments");
            }
            if (!"COMPLETED".equals(requestedAppointment.getStatus())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "Only completed appointments can be reviewed");
            }
            assertWithinReviewWindow(completedAtForAppointment(requestedAppointment), "appointment");

            if (appointment != null && !appointment.getId().equals(requestedAppointment.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "appointmentId and encounterId do not refer to the same visit");
            }
            appointment = requestedAppointment;

            if (encounter == null) {
                encounter = encounterRepository
                        .findByTenantIdAndAppointmentIdAndDeletedAtIsNull(tenantId, appointment.getId())
                        .orElse(null);
            } else if (encounter.getAppointmentId() != null
                    && !encounter.getAppointmentId().equals(appointment.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                        "appointmentId and encounterId do not refer to the same visit");
            }
        }

        UUID hospitalId = encounter != null ? encounter.getHospitalId() : appointment.getHospitalId();
        UUID doctorId = encounter != null && encounter.getPrimaryDoctorId() != null
                ? encounter.getPrimaryDoctorId()
                : (appointment != null ? appointment.getDoctorId() : null);
        Instant completedAt = encounter != null
                ? completedAtForEncounter(encounter)
                : completedAtForAppointment(appointment);

        return new ReviewVisitContext(
                appointment != null ? appointment.getId() : null,
                encounter != null ? encounter.getId() : null,
                hospitalId,
                doctorId,
                completedAt);
    }

    private void assertNoDuplicateDoctorReview(ReviewVisitContext visit) {
        if (visit.appointmentId() != null && doctorReviewRepository.existsByAppointmentId(visit.appointmentId())) {
            throw duplicateReview();
        }
        if (visit.encounterId() != null && doctorReviewRepository.existsByEncounterId(visit.encounterId())) {
            throw duplicateReview();
        }
    }

    private void assertNoDuplicateHospitalReview(ReviewVisitContext visit) {
        if (visit.appointmentId() != null && hospitalReviewRepository.existsByAppointmentId(visit.appointmentId())) {
            throw duplicateReview();
        }
        if (visit.encounterId() != null && hospitalReviewRepository.existsByEncounterId(visit.encounterId())) {
            throw duplicateReview();
        }
    }

    private BusinessException duplicateReview() {
        return new BusinessException(ErrorCode.DUPLICATE_REVIEW, HttpStatus.CONFLICT,
                "A review already exists for this visit");
    }

    private void assertWithinReviewWindow(Instant completedAt, String label) {
        Instant windowEnd = completedAt.plus(REVIEW_WINDOW_DAYS, ChronoUnit.DAYS);
        if (Instant.now().isAfter(windowEnd)) {
            throw new BusinessException(ErrorCode.REVIEW_WINDOW_CLOSED, HttpStatus.BAD_REQUEST,
                    "Review window has closed for this " + label);
        }
    }

    private Instant completedAtForAppointment(AppointmentEntity appointment) {
        return appointment.getCompletedAt() != null
                ? appointment.getCompletedAt()
                : appointment.getScheduledAt();
    }

    private Instant completedAtForEncounter(EncounterEntity encounter) {
        if (encounter.getEndedAt() != null) {
            return encounter.getEndedAt();
        }
        if (encounter.getStartedAt() != null) {
            return encounter.getStartedAt();
        }
        return encounter.getCreatedAt();
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

    private Map<String, Object> auditDetails(ReviewVisitContext visit) {
        Map<String, Object> details = new HashMap<>();
        if (visit.appointmentId() != null) {
            details.put("appointmentId", visit.appointmentId().toString());
        }
        if (visit.encounterId() != null) {
            details.put("encounterId", visit.encounterId().toString());
        }
        return details;
    }

    private String trimComment(String comment) {
        return comment != null && !comment.isBlank() ? comment.trim() : null;
    }

    private SubmitReviewResponse toResponse(
            UUID id,
            UUID appointmentId,
            UUID encounterId,
            int rating,
            String comment,
            Instant createdAt) {
        return SubmitReviewResponse.builder()
                .id(id)
                .appointmentId(appointmentId)
                .encounterId(encounterId)
                .rating(rating)
                .comment(comment)
                .createdAt(createdAt)
                .build();
    }

    private record ReviewVisitContext(
            UUID appointmentId,
            UUID encounterId,
            UUID hospitalId,
            UUID doctorId,
            Instant completedAt) {
    }
}
