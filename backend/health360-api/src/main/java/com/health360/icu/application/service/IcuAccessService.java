package com.health360.icu.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.icu.infrastructure.persistence.entity.IcuStayEntity;
import com.health360.icu.infrastructure.persistence.entity.IcuUnitEntity;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class IcuAccessService {

    private final HospitalScopeService hospitalScopeService;

    public void assertCanReadUnits(UserPrincipal principal) {
        if (!principal.hasPermission("icu:unit:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageUnits(UserPrincipal principal) {
        if (!principal.hasPermission("icu:unit:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadStays(UserPrincipal principal) {
        if (!principal.hasPermission("icu:stay:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageStays(UserPrincipal principal) {
        if (!principal.hasPermission("icu:stay:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadEquipment(UserPrincipal principal) {
        if (!principal.hasPermission("icu:equipment:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageEquipment(UserPrincipal principal) {
        if (!principal.hasPermission("icu:equipment:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadMonitoring(UserPrincipal principal) {
        if (!principal.hasPermission("icu:monitoring:read")) {
            throw forbidden();
        }
    }

    public void assertCanWriteMonitoring(UserPrincipal principal) {
        if (!principal.hasPermission("icu:monitoring:write")) {
            throw forbidden();
        }
    }

    public void assertHospitalScope(UserPrincipal principal, UUID hospitalId) {
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
    }

    public void assertUnitScope(UserPrincipal principal, IcuUnitEntity unit) {
        assertHospitalScope(principal, unit.getHospitalId());
    }

    public void assertStayScope(UserPrincipal principal, IcuStayEntity stay) {
        assertHospitalScope(principal, stay.getHospitalId());
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
