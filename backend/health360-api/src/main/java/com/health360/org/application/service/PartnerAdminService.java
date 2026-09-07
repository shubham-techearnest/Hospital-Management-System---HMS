package com.health360.org.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.org.domain.PartnerOrgType;
import com.health360.org.infrastructure.persistence.entity.HospitalPartnerLinkEntity;
import com.health360.org.infrastructure.persistence.entity.PartnerOrgLocationEntity;
import com.health360.org.infrastructure.persistence.entity.PartnerOrganizationEntity;
import com.health360.org.infrastructure.persistence.repository.HospitalPartnerLinkRepository;
import com.health360.org.infrastructure.persistence.repository.PartnerOrgLocationRepository;
import com.health360.org.infrastructure.persistence.repository.PartnerOrganizationRepository;
import com.health360.org.presentation.dto.request.CreatePartnerLocationRequest;
import com.health360.org.presentation.dto.request.CreatePartnerOrgRequest;
import com.health360.org.presentation.dto.request.LinkHospitalPartnerRequest;
import com.health360.org.presentation.dto.request.UpdatePartnerOrgRequest;
import com.health360.org.presentation.dto.response.HospitalPartnerLinkResponse;
import com.health360.org.presentation.dto.response.PartnerLocationResponse;
import com.health360.org.presentation.dto.response.PartnerOrgResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartnerAdminService {

    private final PartnerOrganizationRepository organizationRepository;
    private final PartnerOrgLocationRepository locationRepository;
    private final HospitalPartnerLinkRepository linkRepository;
    private final HospitalRepository hospitalRepository;
    private final PartnerOrgScopeService scopeService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<PartnerOrgResponse> list(UserPrincipal principal, String orgType) {
        scopeService.assertCanReadPartners(principal);
        UUID tenantId = principal.getTenantId();
        List<PartnerOrganizationEntity> orgs;
        if (orgType != null && !orgType.isBlank()) {
            PartnerOrgType type = parseType(orgType);
            orgs = organizationRepository.findByTenantIdAndOrgTypeAndDeletedAtIsNullOrderByNameAsc(
                    tenantId, type.name());
        } else {
            orgs = organizationRepository.findByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenantId);
        }
        return orgs.stream().map(this::toOrgResponse).toList();
    }

    @Transactional(readOnly = true)
    public PartnerOrgResponse get(UserPrincipal principal, UUID partnerOrgId) {
        scopeService.assertCanReadPartners(principal);
        return toOrgResponse(requireOrg(principal.getTenantId(), partnerOrgId));
    }

    @Transactional
    public PartnerOrgResponse create(UserPrincipal principal, CreatePartnerOrgRequest request) {
        scopeService.assertCanWritePartners(principal);
        PartnerOrgType type = parseType(request.getOrgType());

        PartnerOrganizationEntity org = new PartnerOrganizationEntity();
        org.setTenantId(principal.getTenantId());
        org.setOrgType(type.name());
        org.setName(request.getName().trim());
        org.setRegistrationNumber(blankToNull(request.getRegistrationNumber()));
        org.setStatus("ACTIVE");
        org.setCreatedBy(principal.getUserId());
        org.setUpdatedBy(principal.getUserId());
        org = organizationRepository.saveAndFlush(org);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PARTNER_ORG_CREATED",
                "PartnerOrganization", org.getId(), Map.of("orgType", type.name(), "name", org.getName()));
        return toOrgResponse(org);
    }

    @Transactional
    public PartnerOrgResponse update(UserPrincipal principal, UUID partnerOrgId, UpdatePartnerOrgRequest request) {
        scopeService.assertCanWritePartners(principal);
        PartnerOrganizationEntity org = requireOrg(principal.getTenantId(), partnerOrgId);

        if (request.getName() != null && !request.getName().isBlank()) {
            org.setName(request.getName().trim());
        }
        if (request.getRegistrationNumber() != null) {
            org.setRegistrationNumber(blankToNull(request.getRegistrationNumber()));
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String status = request.getStatus().trim().toUpperCase(Locale.ROOT);
            if (!List.of("ACTIVE", "SUSPENDED").contains(status)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid status");
            }
            org.setStatus(status);
        }
        org.setUpdatedBy(principal.getUserId());
        org.touch();
        org = organizationRepository.save(org);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PARTNER_ORG_UPDATED",
                "PartnerOrganization", org.getId(), Map.of("status", org.getStatus()));
        return toOrgResponse(org);
    }

    @Transactional
    public PartnerLocationResponse addLocation(
            UserPrincipal principal, UUID partnerOrgId, CreatePartnerLocationRequest request) {
        scopeService.assertCanWritePartners(principal);
        PartnerOrganizationEntity org = requireOrg(principal.getTenantId(), partnerOrgId);

        PartnerOrgLocationEntity loc = new PartnerOrgLocationEntity();
        loc.setTenantId(principal.getTenantId());
        loc.setPartnerOrgId(org.getId());
        loc.setName(request.getName().trim());
        loc.setAddressLine1(request.getAddressLine1().trim());
        loc.setAddressLine2(blankToNull(request.getAddressLine2()));
        loc.setCity(request.getCity().trim());
        loc.setState(request.getState().trim());
        loc.setPincode(request.getPincode().trim());
        loc.setCountry(request.getCountry() != null && !request.getCountry().isBlank()
                ? request.getCountry().trim() : "India");
        loc.setLatitude(request.getLatitude());
        loc.setLongitude(request.getLongitude());
        loc.setPhone(blankToNull(request.getPhone()));
        loc.setEmail(blankToNull(request.getEmail()));
        loc.setPrimaryLocation(Boolean.TRUE.equals(request.getPrimaryLocation()));
        loc.setCreatedBy(principal.getUserId());
        loc.setUpdatedBy(principal.getUserId());
        loc = locationRepository.saveAndFlush(loc);

        return toLocationResponse(loc);
    }

    @Transactional
    public HospitalPartnerLinkResponse linkHospital(
            UserPrincipal principal, UUID partnerOrgId, LinkHospitalPartnerRequest request) {
        scopeService.assertCanWritePartners(principal);
        requireOrg(principal.getTenantId(), partnerOrgId);
        hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(request.getHospitalId(), principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Hospital not found"));

        if (linkRepository.existsByHospitalIdAndPartnerOrgIdAndStatusAndDeletedAtIsNull(
                request.getHospitalId(), partnerOrgId, "ACTIVE")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Hospital is already linked to this partner");
        }

        String linkType = request.getLinkType() != null
                ? request.getLinkType().trim().toUpperCase(Locale.ROOT) : "IN_NETWORK";
        if (!List.of("IN_NETWORK", "PREFERRED").contains(linkType)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid link type");
        }

        HospitalPartnerLinkEntity link = new HospitalPartnerLinkEntity();
        link.setTenantId(principal.getTenantId());
        link.setHospitalId(request.getHospitalId());
        link.setPartnerOrgId(partnerOrgId);
        link.setLinkType(linkType);
        link.setStatus("ACTIVE");
        link.setCreatedBy(principal.getUserId());
        link.setUpdatedBy(principal.getUserId());
        link = linkRepository.saveAndFlush(link);

        return HospitalPartnerLinkResponse.builder()
                .linkId(link.getId())
                .hospitalId(link.getHospitalId())
                .partnerOrgId(link.getPartnerOrgId())
                .linkType(link.getLinkType())
                .status(link.getStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public List<HospitalPartnerLinkResponse> listLinks(UserPrincipal principal, UUID partnerOrgId) {
        scopeService.assertCanReadPartners(principal);
        requireOrg(principal.getTenantId(), partnerOrgId);
        return linkRepository.findByTenantIdAndPartnerOrgIdAndDeletedAtIsNull(
                        principal.getTenantId(), partnerOrgId)
                .stream()
                .map(l -> HospitalPartnerLinkResponse.builder()
                        .linkId(l.getId())
                        .hospitalId(l.getHospitalId())
                        .partnerOrgId(l.getPartnerOrgId())
                        .linkType(l.getLinkType())
                        .status(l.getStatus())
                        .build())
                .toList();
    }

    private PartnerOrganizationEntity requireOrg(UUID tenantId, UUID partnerOrgId) {
        return organizationRepository.findByIdAndTenantIdAndDeletedAtIsNull(partnerOrgId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Partner organization not found"));
    }

    private PartnerOrgResponse toOrgResponse(PartnerOrganizationEntity org) {
        List<PartnerLocationResponse> locations = locationRepository
                .findByTenantIdAndPartnerOrgIdAndDeletedAtIsNull(org.getTenantId(), org.getId())
                .stream()
                .map(this::toLocationResponse)
                .toList();
        int linkCount = (int) linkRepository
                .findByTenantIdAndPartnerOrgIdAndDeletedAtIsNull(org.getTenantId(), org.getId())
                .stream()
                .filter(l -> "ACTIVE".equals(l.getStatus()))
                .count();
        return PartnerOrgResponse.builder()
                .partnerOrgId(org.getId())
                .orgType(org.getOrgType())
                .name(org.getName())
                .registrationNumber(org.getRegistrationNumber())
                .status(org.getStatus())
                .locations(locations)
                .hospitalLinkCount(linkCount)
                .build();
    }

    private PartnerLocationResponse toLocationResponse(PartnerOrgLocationEntity loc) {
        return PartnerLocationResponse.builder()
                .locationId(loc.getId())
                .partnerOrgId(loc.getPartnerOrgId())
                .name(loc.getName())
                .addressLine1(loc.getAddressLine1())
                .city(loc.getCity())
                .state(loc.getState())
                .pincode(loc.getPincode())
                .country(loc.getCountry())
                .latitude(loc.getLatitude())
                .longitude(loc.getLongitude())
                .phone(loc.getPhone())
                .email(loc.getEmail())
                .primaryLocation(loc.isPrimaryLocation())
                .build();
    }

    private PartnerOrgType parseType(String value) {
        try {
            return PartnerOrgType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "orgType must be LABORATORY or PHARMACY");
        }
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
