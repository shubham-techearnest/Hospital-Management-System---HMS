package com.health360.dashboard.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.entity.StaffEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.hospital.infrastructure.persistence.repository.StaffRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardScopeService {

    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final StaffRepository staffRepository;
    private final HospitalScopeService hospitalScopeService;

    public DashboardScope resolve(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        UUID tenantId = principal.getTenantId();
        UUID resolvedHospitalId = hospitalId;
        UUID resolvedBranchId = branchId;

        if (resolvedHospitalId == null) {
            resolvedHospitalId = resolveDefaultHospitalId(principal, tenantId);
        }

        hospitalScopeService.assertHospitalScope(principal, resolvedHospitalId, resolvedBranchId);

        if (resolvedBranchId == null) {
            resolvedBranchId = resolvePrimaryBranchId(resolvedHospitalId);
        }

        HospitalEntity hospital = hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(resolvedHospitalId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Hospital not found"));

        BranchEntity branch = branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(resolvedBranchId, resolvedHospitalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Branch not found"));

        return new DashboardScope(resolvedHospitalId, resolvedBranchId, hospital.getName(), branch.getName());
    }

    public DashboardScope resolveHospitalAdmin(UserPrincipal principal) {
        UUID tenantId = principal.getTenantId();
        HospitalEntity hospital = hospitalRepository.findByTenantIdAndAdminUserIdAndDeletedAtIsNull(
                        tenantId, principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Hospital profile not found"));

        UUID branchId = resolvePrimaryBranchId(hospital.getId());
        BranchEntity branch = branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(branchId, hospital.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Branch not found"));

        return new DashboardScope(hospital.getId(), branchId, hospital.getName(), branch.getName());
    }

    private UUID resolveDefaultHospitalId(UserPrincipal principal, UUID tenantId) {
        if (principal.getRoles().contains("HOSPITAL_ADMIN")) {
            return hospitalRepository.findByTenantIdAndAdminUserIdAndDeletedAtIsNull(tenantId, principal.getUserId())
                    .map(HospitalEntity::getId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Hospital profile not found"));
        }

        List<StaffEntity> assignments = staffRepository.findActiveAssignmentsForUser(tenantId, principal.getUserId());
        if (assignments.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "hospitalId is required");
        }
        return assignments.getFirst().getHospitalId();
    }

    private UUID resolvePrimaryBranchId(UUID hospitalId) {
        List<BranchEntity> branches = branchRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId);
        if (branches.isEmpty()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                    "No branches configured for hospital");
        }
        return branches.stream()
                .filter(BranchEntity::isPrimary)
                .map(BranchEntity::getId)
                .findFirst()
                .orElse(branches.getFirst().getId());
    }
}
