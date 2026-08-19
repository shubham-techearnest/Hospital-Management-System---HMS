package com.health360.radiology.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RadiologyAccessService {

    private final HospitalScopeService hospitalScopeService;

    public void assertCanReadCatalog(UserPrincipal principal) {
        if (!principal.hasPermission("radiology:modality:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageCatalog(UserPrincipal principal) {
        if (!principal.hasPermission("radiology:modality:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadOrders(UserPrincipal principal) {
        if (!principal.hasPermission("radiology:order:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageOrders(UserPrincipal principal) {
        if (!principal.hasPermission("radiology:order:write")) {
            throw forbidden();
        }
    }

    public void assertCanWriteReports(UserPrincipal principal) {
        if (!principal.hasPermission("radiology:report:write")) {
            throw forbidden();
        }
    }

    public void assertCanVerifyReports(UserPrincipal principal) {
        if (!principal.hasPermission("radiology:report:verify")) {
            throw forbidden();
        }
    }

    public void assertCanReleaseReports(UserPrincipal principal) {
        if (!principal.hasPermission("radiology:report:release")) {
            throw forbidden();
        }
    }

    public void assertHospitalScope(UserPrincipal principal, UUID hospitalId) {
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
