package com.health360.inventory.application.service;

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
public class InventoryAccessService {

    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;

    public void assertCanRead(UserPrincipal principal) {
        if (!principal.hasPermission("inventory:read") && !principal.hasPermission("inventory:stock:read")) {
            throw forbidden();
        }
    }

    public void assertCanWrite(UserPrincipal principal) {
        if (!principal.hasPermission("inventory:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadStock(UserPrincipal principal) {
        if (!principal.hasPermission("inventory:stock:read") && !principal.hasPermission("inventory:read")) {
            throw forbidden();
        }
    }

    public void assertCanWriteStock(UserPrincipal principal) {
        if (!principal.hasPermission("inventory:stock:write")) {
            throw forbidden();
        }
    }

    public void assertModuleEnabled(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        hospitalScopeService.assertHospitalScope(principal, hospitalId, branchId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_INVENTORY,
                "Consumable inventory is not included in this hospital's subscription plan");
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
