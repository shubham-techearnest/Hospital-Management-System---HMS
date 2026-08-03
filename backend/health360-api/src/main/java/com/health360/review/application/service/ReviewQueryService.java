package com.health360.review.application.service;

import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.review.infrastructure.persistence.entity.DoctorReviewEntity;
import com.health360.review.infrastructure.persistence.entity.HospitalReviewEntity;
import com.health360.review.infrastructure.persistence.repository.DoctorReviewRepository;
import com.health360.review.infrastructure.persistence.repository.HospitalReviewRepository;
import com.health360.review.presentation.dto.response.PagedReviewResponse;
import com.health360.review.presentation.dto.response.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewQueryService {

    private final DoctorReviewRepository doctorReviewRepository;
    private final HospitalReviewRepository hospitalReviewRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedReviewResponse getDoctorReviews(UUID doctorId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Page<DoctorReviewEntity> result = doctorReviewRepository.findByDoctorIdAndVisibleTrueAndDeletedAtIsNullOrderByCreatedAtDesc(
                doctorId, PageRequest.of(safePage, safeSize));
        Map<UUID, String> reviewerNames = loadReviewerNames(
                result.getContent().stream().map(DoctorReviewEntity::getPatientId).collect(Collectors.toSet()));
        return toPagedResponse(result, entity -> ReviewResponse.builder()
                .id(entity.getId())
                .rating(entity.getRating())
                .comment(entity.getComment())
                .reviewerName(reviewerNames.getOrDefault(entity.getPatientId(), "Verified patient"))
                .createdAt(entity.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public PagedReviewResponse getHospitalReviews(UUID hospitalId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Page<HospitalReviewEntity> result = hospitalReviewRepository
                .findByHospitalIdAndVisibleTrueAndDeletedAtIsNullOrderByCreatedAtDesc(
                        hospitalId, PageRequest.of(safePage, safeSize));
        Map<UUID, String> reviewerNames = loadReviewerNames(
                result.getContent().stream().map(HospitalReviewEntity::getPatientId).collect(Collectors.toSet()));
        return toPagedResponse(result, entity -> ReviewResponse.builder()
                .id(entity.getId())
                .rating(entity.getRating())
                .comment(entity.getComment())
                .reviewerName(reviewerNames.getOrDefault(entity.getPatientId(), "Verified patient"))
                .createdAt(entity.getCreatedAt())
                .build());
    }

    private Map<UUID, String> loadReviewerNames(Set<UUID> patientProfileIds) {
        if (patientProfileIds.isEmpty()) {
            return Map.of();
        }
        Map<UUID, UUID> patientToUser = patientProfileRepository.findAllById(patientProfileIds).stream()
                .collect(Collectors.toMap(PatientProfileEntity::getId, PatientProfileEntity::getUserId));
        Set<UUID> userIds = Set.copyOf(patientToUser.values());
        Map<UUID, UserEntity> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserEntity::getId, Function.identity()));
        return patientProfileIds.stream().collect(Collectors.toMap(
                Function.identity(),
                patientId -> {
                    UUID userId = patientToUser.get(patientId);
                    if (userId == null) {
                        return "Verified patient";
                    }
                    UserEntity user = users.get(userId);
                    if (user == null) {
                        return "Verified patient";
                    }
                    return anonymizeName(user.getFirstName(), user.getLastName());
                }));
    }

    private String anonymizeName(String firstName, String lastName) {
        if (firstName == null || firstName.isBlank()) {
            return "Verified patient";
        }
        String initial = lastName != null && !lastName.isBlank()
                ? " " + lastName.charAt(0) + "."
                : "";
        return firstName.trim() + initial;
    }

    private <T> PagedReviewResponse toPagedResponse(Page<T> page, Function<T, ReviewResponse> mapper) {
        return PagedReviewResponse.builder()
                .content(page.getContent().stream().map(mapper).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
