package com.health360.hospital.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class HospitalClinicalCatalogAccessService {

    private final HospitalScopeService hospitalScopeService;
    private final DoctorProfileRepository doctorProfileRepository;
    private final HospitalAssociationRepository hospitalAssociationRepository;

    public void assertCanReadCatalog(UserPrincipal principal) {
        if (!principal.hasPermission("hospital:catalog:read")
                && !principal.hasPermission("hospital:catalog:write")) {
            throw forbidden();
        }
    }

    public void assertCanWriteCatalog(UserPrincipal principal) {
        if (!principal.hasPermission("hospital:catalog:write")) {
            throw forbidden();
        }
    }

    /** Staff/admin hospital scope, or doctor with ACTIVE association. */
    public void assertCatalogHospitalAccess(UserPrincipal principal, UUID hospitalId) {
        if (principal.getRoles().contains("PLATFORM_ADMIN")) {
            return;
        }
        if (principal.getRoles().contains("DOCTOR")) {
            DoctorProfileEntity doctor = doctorProfileRepository
                    .findByTenantIdAndUserIdAndDeletedAtIsNull(principal.getTenantId(), principal.getUserId())
                    .orElse(null);
            if (doctor != null
                    && hospitalAssociationRepository.existsByDoctorIdAndHospitalIdAndStatusAndDeletedAtIsNull(
                    doctor.getId(), hospitalId, "ACTIVE")) {
                return;
            }
        }
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
