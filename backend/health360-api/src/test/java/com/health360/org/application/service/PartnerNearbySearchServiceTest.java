package com.health360.org.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.org.domain.PartnerOrgType;
import com.health360.org.infrastructure.persistence.entity.PartnerOrgLocationEntity;
import com.health360.org.infrastructure.persistence.entity.PartnerOrganizationEntity;
import com.health360.org.infrastructure.persistence.repository.HospitalPartnerLinkRepository;
import com.health360.org.infrastructure.persistence.repository.PartnerOrgLocationRepository;
import com.health360.org.infrastructure.persistence.repository.PartnerOrganizationRepository;
import com.health360.org.presentation.dto.response.NearbyPartnerResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PartnerNearbySearchServiceTest {

    @Mock private PartnerOrganizationRepository organizationRepository;
    @Mock private PartnerOrgLocationRepository locationRepository;
    @Mock private HospitalPartnerLinkRepository hospitalPartnerLinkRepository;
    @Mock private PartnerOrgScopeService scopeService;

    @InjectMocks
    private PartnerNearbySearchService nearbySearchService;

    private final UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private UserPrincipal principal;

    @BeforeEach
    void setUp() {
        principal = new UserPrincipal(
                userId, tenantId, "patient@example.com", "jti",
                List.of("PATIENT"), List.of("partner:nearby:read"));
    }

    @Test
    void findNearbyReturnsSortedPartners() {
        doNothing().when(scopeService).assertCanReadPartners(principal);

        UUID orgId = UUID.fromString("00000000-0000-0000-0000-000000000410");
        UUID locId = UUID.fromString("00000000-0000-0000-0000-000000000412");
        PartnerOrganizationEntity org = new PartnerOrganizationEntity();
        org.setId(orgId);
        org.setTenantId(tenantId);
        org.setOrgType("LABORATORY");
        org.setName("PathCare");
        org.setStatus("ACTIVE");

        PartnerOrgLocationEntity loc = new PartnerOrgLocationEntity();
        loc.setId(locId);
        loc.setTenantId(tenantId);
        loc.setPartnerOrgId(orgId);
        loc.setName("Undri");
        loc.setAddressLine1("Near VTP");
        loc.setCity("Pune");
        loc.setState("MH");
        loc.setPincode("411060");
        loc.setLatitude(18.4562);
        loc.setLongitude(73.9095);

        when(organizationRepository.findByTenantIdAndOrgTypeAndStatusAndDeletedAtIsNull(
                tenantId, "LABORATORY", "ACTIVE")).thenReturn(List.of(org));
        when(locationRepository.findByTenantIdAndPartnerOrgIdAndDeletedAtIsNull(tenantId, orgId))
                .thenReturn(List.of(loc));
        when(hospitalPartnerLinkRepository.findByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNull(
                tenantId, UUID.fromString("00000000-0000-0000-0000-000000000030"), "ACTIVE"))
                .thenReturn(List.of());

        List<NearbyPartnerResponse> results = nearbySearchService.findNearby(
                principal,
                "LABORATORY",
                18.4562,
                73.9095,
                25.0,
                UUID.fromString("00000000-0000-0000-0000-000000000030"));

        assertEquals(1, results.size());
        assertEquals("PathCare", results.get(0).getName());
        assertTrue(results.get(0).getDistanceKm().doubleValue() < 1.0);
    }

    @Test
    void requireActiveLocationRejectsWrongType() {
        UUID orgId = UUID.fromString("00000000-0000-0000-0000-000000000411");
        PartnerOrganizationEntity org = new PartnerOrganizationEntity();
        org.setId(orgId);
        org.setTenantId(tenantId);
        org.setOrgType("PHARMACY");
        org.setStatus("ACTIVE");
        when(organizationRepository.findByIdAndTenantIdAndDeletedAtIsNull(orgId, tenantId))
                .thenReturn(Optional.of(org));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> nearbySearchService.requireActiveLocation(
                        tenantId, orgId, UUID.randomUUID(), PartnerOrgType.LABORATORY));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getCode());
    }
}
