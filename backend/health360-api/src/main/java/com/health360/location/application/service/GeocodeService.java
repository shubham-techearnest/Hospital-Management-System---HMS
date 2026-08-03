package com.health360.location.application.service;

import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.location.infrastructure.persistence.entity.GeocodeCacheEntity;
import com.health360.location.infrastructure.persistence.repository.GeocodeCacheRepository;
import com.health360.location.presentation.dto.response.GeocodeResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GeocodeService {

    private static final Map<String, double[]> CITY_COORDINATES = Map.of(
            "mumbai", new double[] { 19.0760900, 72.8774260 },
            "pune", new double[] { 18.5204300, 73.8567430 },
            "delhi", new double[] { 28.6139390, 77.2090230 },
            "bangalore", new double[] { 12.9715990, 77.5945660 },
            "bengaluru", new double[] { 12.9715990, 77.5945660 },
            "hyderabad", new double[] { 17.3850440, 78.4866710 },
            "chennai", new double[] { 13.0826800, 80.2707210 }
    );

    private final GeocodeCacheRepository geocodeCacheRepository;
    private final BranchRepository branchRepository;

    @Transactional
    public GeocodeResponse geocode(String address) {
        String normalized = normalize(address);
        if (normalized.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Address is required");
        }

        return geocodeCacheRepository.findFirstByNormalizedAddressIgnoreCaseOrderByCreatedAtDesc(normalized)
                .filter(entry -> entry.getExpiresAt().isAfter(Instant.now()))
                .map(this::toResponse)
                .orElseGet(() -> resolveAndCache(normalized, address.trim()));
    }

    @Transactional
    public GeocodeResponse geocodeBranch(UUID branchId) {
        BranchEntity branch = branchRepository.findById(branchId)
                .filter(b -> b.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Branch not found"));

        String address = String.join(", ",
                branch.getAddressLine1(),
                branch.getCity(),
                branch.getState(),
                branch.getPincode(),
                branch.getCountry()).trim();

        GeocodeResponse geocoded = geocode(address);
        branch.setLatitude(geocoded.getLatitude());
        branch.setLongitude(geocoded.getLongitude());
        branchRepository.save(branch);
        return geocoded;
    }

    private GeocodeResponse resolveAndCache(String normalized, String originalAddress) {
        double[] coords = resolveCoordinates(normalized);
        GeocodeCacheEntity entity = new GeocodeCacheEntity();
        entity.setNormalizedAddress(normalized);
        entity.setLatitude(BigDecimal.valueOf(coords[0]));
        entity.setLongitude(BigDecimal.valueOf(coords[1]));
        entity.setFormattedAddress(originalAddress);
        entity.setSource("DEV");
        entity.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
        geocodeCacheRepository.save(entity);
        return toResponse(entity);
    }

    private double[] resolveCoordinates(String normalized) {
        for (Map.Entry<String, double[]> entry : CITY_COORDINATES.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        int hash = Math.abs(normalized.hashCode());
        double latOffset = (hash % 1000) / 100000.0;
        double lngOffset = ((hash / 1000) % 1000) / 100000.0;
        return new double[] { 19.0760900 + latOffset, 72.8774260 + lngOffset };
    }

    private String normalize(String address) {
        return address.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private GeocodeResponse toResponse(GeocodeCacheEntity entity) {
        return GeocodeResponse.builder()
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .formattedAddress(entity.getFormattedAddress())
                .source(entity.getSource())
                .build();
    }
}
