package com.health360.laboratory.application.service;

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
public class LabAccessService {

    private final HospitalScopeService hospitalScopeService;

    public void assertCanReadCatalog(UserPrincipal principal) {
        if (!principal.hasPermission("lab:catalog:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageCatalog(UserPrincipal principal) {
        if (!principal.hasPermission("lab:catalog:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadOrders(UserPrincipal principal) {
        if (!principal.hasPermission("lab:order:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageOrders(UserPrincipal principal) {
        if (!principal.hasPermission("lab:order:write")) {
            throw forbidden();
        }
    }

    public void assertCanWriteResults(UserPrincipal principal) {
        if (!principal.hasPermission("lab:result:write")) {
            throw forbidden();
        }
    }

    public void assertCanVerifyResults(UserPrincipal principal) {
        if (!principal.hasPermission("lab:result:verify")) {
            throw forbidden();
        }
    }

    public void assertCanReleaseReports(UserPrincipal principal) {
        if (!principal.hasPermission("lab:report:release")) {
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
