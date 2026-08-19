package com.health360.ot.application.service;

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
public class OtAccessService {

    private final HospitalScopeService hospitalScopeService;

    public void assertCanReadTheatres(UserPrincipal principal) {
        if (!principal.hasPermission("ot:theatre:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageTheatres(UserPrincipal principal) {
        if (!principal.hasPermission("ot:theatre:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadProcedures(UserPrincipal principal) {
        if (!principal.hasPermission("ot:procedure:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageProcedures(UserPrincipal principal) {
        if (!principal.hasPermission("ot:procedure:write")) {
            throw forbidden();
        }
    }

    public void assertCanManageSchedules(UserPrincipal principal) {
        if (!principal.hasPermission("ot:schedule:write")) {
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
