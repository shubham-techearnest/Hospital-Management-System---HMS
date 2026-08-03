package com.health360.search.application.service;

import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.location.domain.GeoUtils;
import com.health360.search.presentation.dto.request.HospitalSearchRequest;
import com.health360.search.presentation.dto.response.HospitalSearchResultResponse;
import com.health360.search.presentation.dto.response.PagedHospitalSearchResponse;
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
public class HospitalSearchService {

    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public PagedHospitalSearchResponse search(UUID tenantId, HospitalSearchRequest request) {
        int page = Math.max(request.getPage(), 0);
        int size = Math.min(Math.max(request.getSize(), 1), 50);

        List<HospitalSearchResultResponse> matches = new ArrayList<>();
        for (HospitalEntity hospital : hospitalRepository.findByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenantId)) {
            List<BranchEntity> branches = branchRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(
                    hospital.getId());
            BranchDisplay branchDisplay = pickBranch(branches, request.getLatitude(), request.getLongitude());
            if (branchDisplay == null) {
                continue;
            }

            if (!matchesFilters(request, hospital, branchDisplay)) {
                continue;
            }

            matches.add(HospitalSearchResultResponse.builder()
                    .hospitalId(hospital.getId())
                    .name(hospital.getName())
                    .hospitalType(hospital.getHospitalType())
                    .city(branchDisplay.branch().getCity())
                    .branchName(branchDisplay.branch().getName())
                    .addressLine1(branchDisplay.branch().getAddressLine1())
                    .averageRating(hospital.getAverageRating())
                    .reviewCount(hospital.getReviewCount())
                    .emergencyAvailable24x7(hospital.isEmergencyAvailable24x7())
                    .icuAvailable(hospital.isIcuAvailable())
                    .ambulanceAvailable(hospital.isAmbulanceAvailable())
                    .distanceKm(branchDisplay.distanceKm())
                    .build());
        }

        sortMatches(matches, request.getSort());

        int from = Math.min(page * size, matches.size());
        int to = Math.min(from + size, matches.size());
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) matches.size() / size);

        return PagedHospitalSearchResponse.builder()
                .content(matches.subList(from, to))
                .page(page)
                .size(size)
                .totalElements(matches.size())
                .totalPages(totalPages)
                .build();
    }

    private record BranchDisplay(BranchEntity branch, BigDecimal distanceKm) {
    }

    private BranchDisplay pickBranch(List<BranchEntity> branches, Double latitude, Double longitude) {
        BranchDisplay best = null;
        for (BranchEntity branch : branches) {
            BigDecimal distance = null;
            if (latitude != null && longitude != null
                    && GeoUtils.hasCoordinates(branch.getLatitude(), branch.getLongitude())) {
                distance = GeoUtils.distanceKmRounded(
                        latitude, longitude,
                        branch.getLatitude().doubleValue(), branch.getLongitude().doubleValue());
            }
            if (best == null) {
                best = new BranchDisplay(branch, distance);
                continue;
            }
            if (distance != null && (best.distanceKm() == null || distance.compareTo(best.distanceKm()) < 0)) {
                best = new BranchDisplay(branch, distance);
            }
        }
        return best;
    }

    private boolean matchesFilters(
            HospitalSearchRequest request,
            HospitalEntity hospital,
            BranchDisplay branchDisplay) {
        if (request.getQ() != null && !request.getQ().isBlank()) {
            String q = request.getQ().trim().toLowerCase();
            boolean nameMatch = hospital.getName().toLowerCase().contains(q);
            boolean cityMatch = branchDisplay.branch().getCity().toLowerCase().contains(q);
            if (!nameMatch && !cityMatch) {
                return false;
            }
        }

        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            boolean deptMatch = departmentRepository
                    .findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospital.getId())
                    .stream()
                    .anyMatch(d -> d.getName().toLowerCase()
                            .contains(request.getDepartment().trim().toLowerCase()));
            if (!deptMatch) {
                return false;
            }
        }

        if (request.getFacility() != null && !request.getFacility().isBlank()) {
            String facility = request.getFacility().trim().toLowerCase();
            boolean match = switch (facility) {
                case "emergency", "emergency24x7" -> hospital.isEmergencyAvailable24x7();
                case "icu" -> hospital.isIcuAvailable();
                case "ambulance" -> hospital.isAmbulanceAvailable();
                default -> hospital.getDescription() != null
                        && hospital.getDescription().toLowerCase().contains(facility);
            };
            if (!match) {
                return false;
            }
        }

        if (Boolean.TRUE.equals(request.getEmergency24x7()) && !hospital.isEmergencyAvailable24x7()) {
            return false;
        }

        if (Boolean.TRUE.equals(request.getIcuAvailable()) && !hospital.isIcuAvailable()) {
            return false;
        }

        if (request.getMinRating() != null) {
            if (hospital.getAverageRating() == null
                    || hospital.getAverageRating().compareTo(request.getMinRating()) < 0) {
                return false;
            }
        }

        if (request.getMaxDistance() != null && request.getLatitude() != null && request.getLongitude() != null) {
            if (branchDisplay.distanceKm() == null
                    || branchDisplay.distanceKm().doubleValue() > request.getMaxDistance()) {
                return false;
            }
        }

        return true;
    }

    private void sortMatches(List<HospitalSearchResultResponse> matches, String sort) {
        String sortKey = sort != null ? sort.trim().toUpperCase() : "RELEVANCE";
        Comparator<HospitalSearchResultResponse> comparator = switch (sortKey) {
            case "NEAREST" -> Comparator.comparing(
                    HospitalSearchResultResponse::getDistanceKm,
                    Comparator.nullsLast(Comparator.naturalOrder()));
            case "HIGHEST_RATED" -> Comparator.comparing(
                    HospitalSearchResultResponse::getAverageRating,
                    Comparator.nullsLast(Comparator.reverseOrder()));
            default -> Comparator.comparing(HospitalSearchResultResponse::getName, String.CASE_INSENSITIVE_ORDER);
        };
        matches.sort(comparator);
    }
}
