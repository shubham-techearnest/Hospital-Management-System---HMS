package com.health360.asset.application.service;

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
public class AssetAccessService {

    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;

    public void assertCanRead(UserPrincipal principal) {
        if (!principal.hasPermission("asset:read")) {
            throw forbidden();
        }
    }

    public void assertCanWrite(UserPrincipal principal) {
        if (!principal.hasPermission("asset:write")) {
            throw forbidden();
        }
    }

    public void assertCanWriteMaintenance(UserPrincipal principal) {
        if (!principal.hasPermission("asset:maintenance:write")
                && !principal.hasPermission("asset:write")) {
            throw forbidden();
        }
    }

    public void assertCanWriteTicket(UserPrincipal principal) {
        if (!principal.hasPermission("asset:ticket:write")
                && !principal.hasPermission("asset:maintenance:write")
                && !principal.hasPermission("asset:write")) {
            throw forbidden();
        }
    }

    public void assertCanDispose(UserPrincipal principal) {
        if (!principal.hasPermission("asset:dispose") && !principal.hasPermission("asset:write")) {
            throw forbidden();
        }
    }

    public void assertHospitalScope(UserPrincipal principal, UUID hospitalId) {
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
    }

    public void assertModuleEnabled(UserPrincipal principal, UUID hospitalId) {
        assertHospitalScope(principal, hospitalId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_ASSET_MANAGEMENT,
                "Asset management is not included in this hospital's subscription plan");
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
