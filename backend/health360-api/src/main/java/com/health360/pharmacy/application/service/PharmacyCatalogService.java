package com.health360.pharmacy.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.pharmacy.infrastructure.persistence.entity.MedicineEntity;
import com.health360.pharmacy.infrastructure.persistence.repository.MedicineRepository;
import com.health360.pharmacy.presentation.dto.request.CreateMedicineRequest;
import com.health360.pharmacy.presentation.dto.response.MedicineResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PharmacyCatalogService {

    private final MedicineRepository medicineRepository;
    private final PharmacyAccessService accessService;
    private final PharmacyMapper mapper;

    @Transactional
    public MedicineResponse createMedicine(UserPrincipal principal, CreateMedicineRequest request) {
        accessService.assertCanManageMedicines(principal);
        accessService.assertHospitalScope(principal, request.getHospitalId());

        MedicineEntity entity = new MedicineEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(request.getHospitalId());
        entity.setBranchId(request.getBranchId());
        entity.setCode(request.getCode().trim());
        entity.setName(request.getName().trim());
        entity.setForm(request.getForm() != null ? request.getForm().trim().toUpperCase() : "TABLET");
        entity.setStrength(request.getStrength());
        entity.setDefaultRoute(request.getDefaultRoute() != null
                ? request.getDefaultRoute().trim().toUpperCase() : "ORAL");
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        return mapper.toMedicineResponse(medicineRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> listMedicines(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadMedicines(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        return medicineRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(mapper::toMedicineResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedicineEntity requireMedicine(UUID tenantId, UUID medicineId) {
        return medicineRepository.findByIdAndTenantIdAndDeletedAtIsNull(medicineId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Medicine not found"));
    }
}
