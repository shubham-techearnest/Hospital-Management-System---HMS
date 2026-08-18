package com.health360.opd.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.opd.infrastructure.persistence.entity.OpdDeskEntity;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OpdAccessService {

    private final EncounterAccessService encounterAccessService;

    public void assertCanManageRegistration(UserPrincipal principal) {
        if (!principal.hasPermission("opd:registration:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadQueue(UserPrincipal principal) {
        if (!principal.hasPermission("opd:queue:read")) {
            throw forbidden();
        }
    }

    public void assertCanWriteQueue(UserPrincipal principal) {
        if (!principal.hasPermission("opd:queue:write")) {
            throw forbidden();
        }
    }

    public void assertCanManageDesks(UserPrincipal principal) {
        if (!principal.hasPermission("opd:desk:write")) {
            throw forbidden();
        }
    }

    public void assertCanReadDesks(UserPrincipal principal) {
        if (!principal.hasPermission("opd:desk:read")) {
            throw forbidden();
        }
    }

    public void assertHospitalScope(UserPrincipal principal, UUID hospitalId) {
        if (principal.getRoles().contains("HOSPITAL_ADMIN")) {
            HospitalEntity hospital = encounterAccessService.requireHospital(
                    principal.getTenantId(), hospitalId);
            if (!hospital.getAdminUserId().equals(principal.getUserId())) {
                throw forbidden();
            }
        }
    }

    public void assertQueueEntryScope(UserPrincipal principal, OpdQueueEntryEntity entry) {
        assertHospitalScope(principal, entry.getHospitalId());
    }

    public void assertDeskScope(UserPrincipal principal, OpdDeskEntity desk) {
        assertHospitalScope(principal, desk.getHospitalId());
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
