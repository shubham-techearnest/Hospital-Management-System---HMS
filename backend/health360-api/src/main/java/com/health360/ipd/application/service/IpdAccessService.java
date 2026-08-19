package com.health360.ipd.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdWardEntity;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class IpdAccessService {

    private final HospitalScopeService hospitalScopeService;

    public void assertCanReadWards(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:ward:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageWards(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:ward:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadBeds(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:bed:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageBeds(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:bed:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadAdmissions(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:admission:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageAdmissions(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:admission:write")) {
            throw forbidden();
        }
    }

    public void assertCanWriteRounds(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:round:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadRounds(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:round:read")) {
            throw forbidden();
        }
    }

    public void assertCanDischarge(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:discharge:write")) {
            throw forbidden();
        }
    }

    public void assertHospitalScope(UserPrincipal principal, UUID hospitalId) {
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
    }

    public void assertWardScope(UserPrincipal principal, IpdWardEntity ward) {
        assertHospitalScope(principal, ward.getHospitalId());
    }

    public void assertAdmissionScope(UserPrincipal principal, IpdAdmissionEntity admission) {
        assertHospitalScope(principal, admission.getHospitalId());
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
