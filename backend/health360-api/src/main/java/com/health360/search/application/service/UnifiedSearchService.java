package com.health360.search.application.service;

import com.health360.search.presentation.dto.request.DoctorSearchRequest;
import com.health360.search.presentation.dto.request.HospitalSearchRequest;
import com.health360.search.presentation.dto.response.UnifiedSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UnifiedSearchService {

    private final DoctorSearchService doctorSearchService;
    private final HospitalSearchService hospitalSearchService;

    @Transactional(readOnly = true)
    public UnifiedSearchResponse search(
            UUID tenantId,
            String q,
            String type,
            Double latitude,
            Double longitude,
            Double maxDistance,
            int page,
            int size) {
        String normalizedType = type != null ? type.trim().toUpperCase() : "ALL";
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        var doctors = ("ALL".equals(normalizedType) || "DOCTOR".equals(normalizedType))
                ? doctorSearchService.search(tenantId, buildDoctorRequest(q, latitude, longitude, maxDistance, safePage, safeSize))
                : null;

        var hospitals = ("ALL".equals(normalizedType) || "HOSPITAL".equals(normalizedType))
                ? hospitalSearchService.search(tenantId, buildHospitalRequest(q, latitude, longitude, maxDistance, safePage, safeSize))
                : null;

        return UnifiedSearchResponse.builder()
                .doctors(doctors != null ? doctors.getContent() : java.util.List.of())
                .hospitals(hospitals != null ? hospitals.getContent() : java.util.List.of())
                .doctorCount(doctors != null ? (int) doctors.getTotalElements() : 0)
                .hospitalCount(hospitals != null ? (int) hospitals.getTotalElements() : 0)
                .page(safePage)
                .size(safeSize)
                .build();
    }

    private DoctorSearchRequest buildDoctorRequest(
            String q, Double latitude, Double longitude, Double maxDistance, int page, int size) {
        DoctorSearchRequest request = new DoctorSearchRequest();
        request.setQ(q);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setMaxDistance(maxDistance);
        request.setPage(page);
        request.setSize(size);
        return request;
    }

    private HospitalSearchRequest buildHospitalRequest(
            String q, Double latitude, Double longitude, Double maxDistance, int page, int size) {
        HospitalSearchRequest request = new HospitalSearchRequest();
        request.setQ(q);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setMaxDistance(maxDistance);
        request.setPage(page);
        request.setSize(size);
        return request;
    }
}
