package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.presentation.dto.response.DuplicateCandidateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DuplicateDetectionService {

    private static final double NAME_DOB_BLOCK_THRESHOLD = 0.85;

    private final PatientProfileRepository patientProfileRepository;

    public List<DuplicateCandidateResponse> findCandidates(
            UUID tenantId,
            String primaryPhone,
            String legalFirstName,
            String legalLastName,
            LocalDate dateOfBirth) {

        Map<UUID, DuplicateCandidateResponse> candidates = new LinkedHashMap<>();

        if (primaryPhone != null && !primaryPhone.isBlank()) {
            patientProfileRepository.findByTenantIdAndPrimaryPhone(tenantId, primaryPhone)
                    .forEach(profile -> candidates.put(profile.getId(), toCandidate(profile, 1.0, "MOBILE_EXACT")));
        }

        if (dateOfBirth != null && legalFirstName != null && legalLastName != null) {
            double score = nameDobScore(legalFirstName, legalLastName);
            if (score >= NAME_DOB_BLOCK_THRESHOLD) {
                patientProfileRepository.findExactNameAndDob(
                                tenantId,
                                legalFirstName.trim(),
                                legalLastName.trim(),
                                dateOfBirth)
                        .forEach(profile -> candidates.putIfAbsent(
                                profile.getId(),
                                toCandidate(profile, score, "NAME_DOB_MATCH")));
            }
        }

        return new ArrayList<>(candidates.values());
    }

    public boolean shouldBlockRegistration(List<DuplicateCandidateResponse> candidates) {
        // Family may share one mobile across multiple patient accounts.
        // Block only when name+DOB strongly matches an existing person.
        return candidates.stream().anyMatch(c -> "NAME_DOB_MATCH".equals(c.getMatchReason()));
    }

    private DuplicateCandidateResponse toCandidate(PatientProfileEntity profile, double score, String reason) {
        String displayName = buildDisplayName(profile);
        return DuplicateCandidateResponse.builder()
                .patientId(profile.getId())
                .uhid(profile.getUhid())
                .legalName(displayName)
                .primaryPhone(profile.getPrimaryPhone())
                .dateOfBirth(profile.getDateOfBirth())
                .matchScore(score)
                .matchReason(reason)
                .build();
    }

    private String buildDisplayName(PatientProfileEntity profile) {
        String first = profile.getLegalFirstName() != null ? profile.getLegalFirstName() : "";
        String last = profile.getLegalLastName() != null ? profile.getLegalLastName() : "";
        return (first + " " + last).trim();
    }

    private double nameDobScore(String firstName, String lastName) {
        if (firstName == null || lastName == null) {
            return 0;
        }
        if (firstName.trim().length() >= 2 && lastName.trim().length() >= 2) {
            return 0.9;
        }
        return 0;
    }
}
