package com.health360.pharmacy.application.service;

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
public class PharmacyAccessService {

    private final HospitalScopeService hospitalScopeService;

    public void assertCanReadMedicines(UserPrincipal principal) {
        if (!principal.hasPermission("pharmacy:medicine:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageMedicines(UserPrincipal principal) {
        if (!principal.hasPermission("pharmacy:medicine:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadMedicationOrders(UserPrincipal principal) {
        if (!principal.hasPermission("pharmacy:medication:read")) {
            throw forbidden();
        }
    }

    public void assertCanManageMedicationOrders(UserPrincipal principal) {
        if (!principal.hasPermission("pharmacy:medication:write")) {
            throw forbidden();
        }
    }

    public void assertCanAdministerMedication(UserPrincipal principal) {
        if (!principal.hasPermission("pharmacy:medication:administer")) {
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
