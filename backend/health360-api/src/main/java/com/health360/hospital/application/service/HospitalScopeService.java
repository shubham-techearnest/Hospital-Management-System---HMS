package com.health360.hospital.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.StaffEntity;
import com.health360.hospital.infrastructure.persistence.repository.StaffRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class HospitalScopeService {

    private static final Set<String> STAFF_SCOPED_ROLES = Set.of(
            "RECEPTIONIST",
            "NURSE",
            "ICU_NURSE",
            "LAB_TECHNICIAN",
            "RADIOLOGY_TECHNICIAN",
            "PHARMACIST",
            "OT_COORDINATOR"
    );

    private final EncounterAccessService encounterAccessService;
    private final StaffRepository staffRepository;

    public void assertHospitalScope(UserPrincipal principal, UUID hospitalId) {
        assertHospitalScope(principal, hospitalId, null);
    }

    public void assertHospitalScope(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        if (principal.getRoles().contains("PLATFORM_ADMIN")) {
            return;
        }

        if (principal.getRoles().contains("HOSPITAL_ADMIN")) {
            encounterAccessService.assertHospitalAdminScope(principal, hospitalId);
            return;
        }

        if (principal.getRoles().stream().anyMatch(STAFF_SCOPED_ROLES::contains)) {
            assertStaffScope(principal, hospitalId, branchId);
            return;
        }

        // Doctors and patients use encounter-level checks elsewhere; deny hospital-wide ops by default.
        throw forbidden();
    }

    public boolean isStaffScopedRole(UserPrincipal principal) {
        return principal.getRoles().stream().anyMatch(STAFF_SCOPED_ROLES::contains);
    }

    private void assertStaffScope(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        List<StaffEntity> assignments = staffRepository.findActiveAssignmentsForUser(
                principal.getTenantId(), principal.getUserId());

        boolean allowed = assignments.stream()
                .filter(s -> s.getHospitalId().equals(hospitalId))
                .anyMatch(s -> branchId == null
                        || s.getBranchId() == null
                        || s.getBranchId().equals(branchId));

        if (!allowed) {
            throw forbidden();
        }
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }
}
