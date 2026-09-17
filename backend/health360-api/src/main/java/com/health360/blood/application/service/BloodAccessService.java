package com.health360.blood.application.service;

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
public class BloodAccessService {

    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;

    public void assertCanRead(UserPrincipal principal) {
        if (!principal.hasPermission("blood:read")) {
            throw forbidden();
        }
    }

    public void assertCanWrite(UserPrincipal principal) {
        if (!principal.hasPermission("blood:write")) {
            throw forbidden();
        }
    }

    public void assertCanIssue(UserPrincipal principal) {
        if (!principal.hasPermission("blood:issue")) {
            throw forbidden();
        }
    }

    public void assertModuleEnabled(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        hospitalScopeService.assertHospitalScope(principal, hospitalId, branchId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_BLOOD_BANK,
                "Blood bank is not included in this hospital's subscription plan");
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
