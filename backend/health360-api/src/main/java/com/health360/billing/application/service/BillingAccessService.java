package com.health360.billing.application.service;

import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.clinical.application.service.EncounterAccessService;
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
public class BillingAccessService {

    private final HospitalScopeService hospitalScopeService;
    private final EncounterAccessService encounterAccessService;

    public void assertCanReadInvoices(UserPrincipal principal) {
        if (!principal.hasPermission("billing:invoice:read")) {
            throw forbidden();
        }
    }

    public void assertCanWriteInvoices(UserPrincipal principal) {
        if (!principal.hasPermission("billing:invoice:write")) {
            throw forbidden();
        }
    }

    public void assertCanWritePayments(UserPrincipal principal) {
        if (!principal.hasPermission("billing:payment:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadInvoice(UserPrincipal principal, InvoiceEntity invoice) {
        assertCanReadInvoices(principal);
        if (principal.hasPermission("billing:invoice:write")) {
            hospitalScopeService.assertHospitalScope(principal, invoice.getHospitalId(), invoice.getBranchId());
            return;
        }
        assertPatientOwnsInvoice(principal, invoice);
    }

    public void assertCanWriteInvoice(UserPrincipal principal, InvoiceEntity invoice) {
        assertCanWriteInvoices(principal);
        hospitalScopeService.assertHospitalScope(principal, invoice.getHospitalId(), invoice.getBranchId());
    }

    private void assertPatientOwnsInvoice(UserPrincipal principal, InvoiceEntity invoice) {
        UUID patientProfileId = encounterAccessService.resolvePatientProfileIdForUser(
                principal.getUserId(), principal.getTenantId());
        if (patientProfileId == null || !patientProfileId.equals(invoice.getPatientId())) {
            throw forbidden();
        }
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
