package com.health360.patient.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.entity.StaffEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.hospital.infrastructure.persistence.repository.StaffRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class HospitalRegistrationScopeService {

    private final StaffRepository staffRepository;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;

    public RegistrationScope resolveScope(UserPrincipal principal) {
        UUID tenantId = principal.getTenantId();

        if (principal.getRoles().contains("HOSPITAL_ADMIN")) {
            HospitalEntity hospital = hospitalRepository
                    .findByTenantIdAndAdminUserIdAndDeletedAtIsNull(tenantId, principal.getUserId())
                    .orElseThrow(() -> new BusinessException(
                            ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Hospital admin scope not found"));

            UUID branchId = branchRepository
                    .findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospital.getId())
                    .stream()
                    .findFirst()
                    .map(b -> b.getId())
                    .orElse(null);

            return new RegistrationScope(hospital.getId(), branchId, hospital.getName());
        }

        List<StaffEntity> assignments = staffRepository.findActiveAssignmentsForUser(
                tenantId, principal.getUserId());
        if (assignments.isEmpty()) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "No active hospital assignment");
        }

        StaffEntity staff = assignments.getFirst();
        HospitalEntity hospital = hospitalRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(staff.getHospitalId(), tenantId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Hospital not found"));

        return new RegistrationScope(staff.getHospitalId(), staff.getBranchId(), hospital.getName());
    }

    public record RegistrationScope(UUID hospitalId, UUID branchId, String hospitalName) {
    }
}
