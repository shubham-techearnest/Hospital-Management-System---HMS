package com.health360.org.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.location.domain.GeoUtils;
import com.health360.org.domain.PartnerOrgType;
import com.health360.org.infrastructure.persistence.entity.HospitalPartnerLinkEntity;
import com.health360.org.infrastructure.persistence.entity.PartnerOrgLocationEntity;
import com.health360.org.infrastructure.persistence.entity.PartnerOrganizationEntity;
import com.health360.org.infrastructure.persistence.repository.HospitalPartnerLinkRepository;
import com.health360.org.infrastructure.persistence.repository.PartnerOrgLocationRepository;
import com.health360.org.infrastructure.persistence.repository.PartnerOrganizationRepository;
import com.health360.org.presentation.dto.response.NearbyPartnerResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartnerNearbySearchService {

    private final PartnerOrganizationRepository organizationRepository;
    private final PartnerOrgLocationRepository locationRepository;
    private final HospitalPartnerLinkRepository hospitalPartnerLinkRepository;
    private final PartnerOrgScopeService scopeService;

    @Transactional(readOnly = true)
    public List<NearbyPartnerResponse> findNearby(
            UserPrincipal principal,
            String orgType,
            double latitude,
            double longitude,
            Double radiusKm,
            UUID hospitalId) {
        scopeService.assertCanReadPartners(principal);
        PartnerOrgType type = parseType(orgType);
        UUID tenantId = principal.getTenantId();
        double maxKm = radiusKm != null && radiusKm > 0 ? radiusKm : 25.0;

        Set<UUID> inNetwork = new HashSet<>();
        if (hospitalId != null) {
            for (HospitalPartnerLinkEntity link : hospitalPartnerLinkRepository
                    .findByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNull(tenantId, hospitalId, "ACTIVE")) {
                inNetwork.add(link.getPartnerOrgId());
            }
        }

        List<PartnerOrganizationEntity> orgs = organizationRepository
                .findByTenantIdAndOrgTypeAndStatusAndDeletedAtIsNull(tenantId, type.name(), "ACTIVE");
        List<NearbyPartnerResponse> results = new ArrayList<>();

        for (PartnerOrganizationEntity org : orgs) {
            for (PartnerOrgLocationEntity loc :
                    locationRepository.findByTenantIdAndPartnerOrgIdAndDeletedAtIsNull(tenantId, org.getId())) {
                if (!GeoUtils.hasCoordinates(loc.getLatitude(), loc.getLongitude())) {
                    continue;
                }
                BigDecimal distance = GeoUtils.distanceKmRounded(
                        latitude, longitude, loc.getLatitude(), loc.getLongitude());
                if (distance.doubleValue() > maxKm) {
                    continue;
                }
                results.add(NearbyPartnerResponse.builder()
                        .partnerOrgId(org.getId())
                        .name(org.getName())
                        .orgType(org.getOrgType())
                        .locationId(loc.getId())
                        .locationName(loc.getName())
                        .addressLine1(loc.getAddressLine1())
                        .city(loc.getCity())
                        .state(loc.getState())
                        .pincode(loc.getPincode())
                        .distanceKm(distance)
                        .inNetwork(inNetwork.contains(org.getId()))
                        .phone(loc.getPhone())
                        .build());
            }
        }

        results.sort(Comparator
                .comparing(NearbyPartnerResponse::isInNetwork).reversed()
                .thenComparing(NearbyPartnerResponse::getDistanceKm,
                        Comparator.nullsLast(Comparator.naturalOrder())));
        return results;
    }

    @Transactional(readOnly = true)
    public PartnerOrgLocationEntity requireActiveLocation(
            UUID tenantId, UUID partnerOrgId, UUID locationId, PartnerOrgType expectedType) {
        PartnerOrganizationEntity org = organizationRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(partnerOrgId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Partner organization not found"));
        if (!"ACTIVE".equals(org.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Partner organization is not active");
        }
        if (!expectedType.name().equals(org.getOrgType())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Partner organization type must be " + expectedType.name());
        }
        PartnerOrgLocationEntity location = locationRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(locationId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Partner location not found"));
        if (!location.getPartnerOrgId().equals(partnerOrgId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Location does not belong to partner organization");
        }
        return location;
    }

    private PartnerOrgType parseType(String orgType) {
        if (orgType == null || orgType.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "org type is required (LABORATORY or PHARMACY)");
        }
        try {
            return PartnerOrgType.valueOf(orgType.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "org type must be LABORATORY or PHARMACY");
        }
    }
}
