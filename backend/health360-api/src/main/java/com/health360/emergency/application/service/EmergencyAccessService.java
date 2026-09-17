package com.health360.emergency.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EmergencyAccessService {

    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;

    public void assertCanRead(UserPrincipal principal) {
        if (!principal.hasPermission("emergency:read")) {
            throw forbidden();
        }
    }

    public void assertCanWrite(UserPrincipal principal) {
        if (!principal.hasPermission("emergency:write")) {
            throw forbidden();
        }
    }

    public void assertCanDisposition(UserPrincipal principal) {
        if (!principal.hasPermission("emergency:disposition")
                && !principal.hasPermission("emergency:write")) {
            throw forbidden();
        }
    }

    public void assertModuleEnabled(UserPrincipal principal, UUID hospitalId) {
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_EMERGENCY,
                "Emergency / ED module is not included in this hospital's subscription plan");
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
