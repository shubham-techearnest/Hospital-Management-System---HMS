package com.health360.ipd.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.ipd.domain.IpdServiceKeys;
import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdWardEntity;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class IpdAccessService {

    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;
    private final IpdServiceCatalogService ipdServiceCatalogService;

    public IpdAccessService(
            HospitalScopeService hospitalScopeService,
            FeatureAccessService featureAccessService,
            @Lazy IpdServiceCatalogService ipdServiceCatalogService) {
        this.hospitalScopeService = hospitalScopeService;
        this.featureAccessService = featureAccessService;
        this.ipdServiceCatalogService = ipdServiceCatalogService;
    }

    public void assertCanReadSettings(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:settings:read") && !principal.hasPermission("ipd:admin")) {
            throw forbidden();
        }
    }

    public void assertCanManageSettings(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:settings:write") && !principal.hasPermission("ipd:admin")) {
            throw forbidden();
        }
    }

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

    public void assertCanCreateAdmissionRequest(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:admission-request:create")
                && !principal.hasPermission("ipd:admission:write")
                && !principal.hasPermission("ipd:admin")) {
            throw forbidden();
        }
    }

    public void assertCanReadAdmissionRequest(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:admission-request:read")
                && !principal.hasPermission("ipd:admission:read")
                && !principal.hasPermission("ipd:admin")) {
            throw forbidden();
        }
    }

    public void assertCanReviewAdmissionRequest(UserPrincipal principal) {
        if (!principal.hasPermission("ipd:admission-request:review")
                && !principal.hasPermission("ipd:admin")) {
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

    /** Plan + IPD_CORE gate for operational IPD APIs. */
    public void assertIpdModuleEnabled(UserPrincipal principal, UUID hospitalId) {
        assertHospitalScope(principal, hospitalId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_IPD,
                "IPD is not included in this hospital's subscription plan");
        ipdServiceCatalogService.assertServiceEnabled(
                hospitalId,
                principal.getTenantId(),
                IpdServiceKeys.IPD_CORE,
                "Inpatient core services are disabled for this hospital. Enable IPD services in hospital settings.");
    }

    public void assertIpdServiceEnabled(UserPrincipal principal, UUID hospitalId, String serviceKey, String message) {
        assertIpdModuleEnabled(principal, hospitalId);
        if (IpdServiceKeys.IPD_CORE.equals(serviceKey)) {
            return;
        }
        ipdServiceCatalogService.assertServiceEnabled(hospitalId, principal.getTenantId(), serviceKey, message);
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
