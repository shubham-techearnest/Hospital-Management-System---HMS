package com.health360.location.application.service;

import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.location.domain.GeoUtils;
import com.health360.location.presentation.dto.response.NearbyHospitalResponse;
import com.health360.location.presentation.dto.response.PagedNearbyHospitalResponse;
import com.health360.search.application.service.DoctorSearchService;
import com.health360.search.presentation.dto.request.DoctorSearchRequest;
import com.health360.search.presentation.dto.response.PagedDoctorSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NearbyLocationService {

    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorSearchService doctorSearchService;

    @Transactional(readOnly = true)
    public PagedNearbyHospitalResponse nearbyHospitals(
            UUID tenantId,
            double latitude,
            double longitude,
            double radiusKm,
            String department,
            Boolean emergency24x7,
            BigDecimal minRating,
            int page,
            int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        double safeRadius = Math.min(Math.max(radiusKm, 0.5), 50.0);

        List<NearbyHospitalResponse> matches = new ArrayList<>();
        for (HospitalEntity hospital : hospitalRepository.findByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenantId)) {
            if (minRating != null && (hospital.getAverageRating() == null
                    || hospital.getAverageRating().compareTo(minRating) < 0)) {
                continue;
            }
            if (Boolean.TRUE.equals(emergency24x7) && !hospital.isEmergencyAvailable24x7()) {
                continue;
            }

            List<BranchEntity> branches = branchRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(
                    hospital.getId());
            BranchEntity nearest = null;
            BigDecimal nearestDistance = null;

            for (BranchEntity branch : branches) {
                if (!GeoUtils.hasCoordinates(branch.getLatitude(), branch.getLongitude())) {
                    continue;
                }
                double distance = GeoUtils.distanceKm(
                        latitude, longitude,
                        branch.getLatitude().doubleValue(), branch.getLongitude().doubleValue());
                if (distance > safeRadius) {
                    continue;
                }
                BigDecimal distanceRounded = BigDecimal.valueOf(distance).setScale(1, java.math.RoundingMode.HALF_UP);
                if (nearestDistance == null || distanceRounded.compareTo(nearestDistance) < 0) {
                    nearest = branch;
                    nearestDistance = distanceRounded;
                }
            }

            if (nearest == null) {
                continue;
            }

            if (department != null && !department.isBlank()) {
                boolean deptMatch = departmentRepository
                        .findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospital.getId())
                        .stream()
                        .anyMatch(d -> d.getName().toLowerCase().contains(department.trim().toLowerCase()));
                if (!deptMatch) {
                    continue;
                }
            }

            matches.add(NearbyHospitalResponse.builder()
                    .hospitalId(hospital.getId())
                    .hospitalName(hospital.getName())
                    .hospitalType(hospital.getHospitalType())
                    .branchId(nearest.getId())
                    .branchName(nearest.getName())
                    .city(nearest.getCity())
                    .addressLine1(nearest.getAddressLine1())
                    .distanceKm(nearestDistance)
                    .averageRating(hospital.getAverageRating())
                    .reviewCount(hospital.getReviewCount())
                    .emergencyAvailable24x7(hospital.isEmergencyAvailable24x7())
                    .icuAvailable(hospital.isIcuAvailable())
                    .ambulanceAvailable(hospital.isAmbulanceAvailable())
                    .build());
        }

        matches.sort(Comparator.comparing(NearbyHospitalResponse::getDistanceKm));
        return paginate(matches, safePage, safeSize);
    }

    @Transactional(readOnly = true)
    public PagedDoctorSearchResponse nearbyDoctors(
            UUID tenantId,
            double latitude,
            double longitude,
            double radiusKm,
            String specialization,
            int page,
            int size) {
        DoctorSearchRequest request = new DoctorSearchRequest();
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setMaxDistance(radiusKm);
        request.setSpecialization(specialization);
        request.setSort("NEAREST");
        request.setPage(page);
        request.setSize(size);
        return doctorSearchService.search(tenantId, request);
    }

    private <T> PagedNearbyHospitalResponse paginate(List<NearbyHospitalResponse> items, int page, int size) {
        int from = Math.min(page * size, items.size());
        int to = Math.min(from + size, items.size());
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) items.size() / size);
        return PagedNearbyHospitalResponse.builder()
                .content(items.subList(from, to))
                .page(page)
                .size(size)
                .totalElements(items.size())
                .totalPages(totalPages)
                .build();
    }
}
