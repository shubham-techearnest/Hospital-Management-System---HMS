package com.health360.pharmacy.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.pharmacy.infrastructure.persistence.entity.MedicineBatchEntity;
import com.health360.pharmacy.infrastructure.persistence.entity.MedicineEntity;
import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestEntity;
import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestItemEntity;
import com.health360.pharmacy.infrastructure.persistence.entity.StockTransactionEntity;
import com.health360.pharmacy.infrastructure.persistence.repository.MedicineBatchRepository;
import com.health360.pharmacy.infrastructure.persistence.repository.MedicineRepository;
import com.health360.pharmacy.infrastructure.persistence.repository.PharmacyRequestItemRepository;
import com.health360.pharmacy.infrastructure.persistence.repository.StockTransactionRepository;
import com.health360.pharmacy.presentation.dto.request.ReceiveStockRequest;
import com.health360.pharmacy.presentation.dto.response.MedicineBatchResponse;
import com.health360.pharmacy.presentation.dto.response.MedicineStockSummaryResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PharmacyInventoryService {

    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository batchRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final PharmacyRequestItemRepository requestItemRepository;
    private final PharmacyAccessService accessService;
    private final AuditLogService auditLogService;

    @Transactional
    public MedicineBatchResponse receiveStock(UserPrincipal principal, ReceiveStockRequest request) {
        accessService.assertCanWriteStock(principal);
        MedicineEntity medicine = medicineRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getMedicineId(), principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Medicine not found"));
        accessService.assertHospitalScope(principal, medicine.getHospitalId());

        MedicineBatchEntity batch = new MedicineBatchEntity();
        batch.setTenantId(principal.getTenantId());
        batch.setHospitalId(medicine.getHospitalId());
        batch.setBranchId(medicine.getBranchId());
        batch.setMedicineId(medicine.getId());
        batch.setBatchNumber(request.getBatchNumber().trim());
        batch.setExpiryDate(request.getExpiryDate());
        batch.setQuantityOnHand(request.getQuantity());
        batch.setUnitCost(request.getUnitCost());
        batch.setNotes(request.getNotes());
        batch.setReceivedAt(Instant.now());
        batch.setCreatedBy(principal.getUserId());
        batch.setUpdatedBy(principal.getUserId());
        batch = batchRepository.saveAndFlush(batch);

        recordTxn(principal, medicine, batch.getId(), "RECEIVE", request.getQuantity(),
                "MedicineBatch", batch.getId(), "Stock received");

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "PHARMACY_STOCK_RECEIVED",
                "MedicineBatch", batch.getId(),
                Map.of("medicineId", medicine.getId(), "qty", request.getQuantity()));

        return toBatchResponse(batch, medicine.getName());
    }

    @Transactional(readOnly = true)
    public MedicineStockSummaryResponse getStock(UserPrincipal principal, UUID medicineId) {
        accessService.assertCanReadStock(principal);
        MedicineEntity medicine = medicineRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(medicineId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Medicine not found"));
        accessService.assertHospitalScope(principal, medicine.getHospitalId());

        List<MedicineBatchEntity> batches = batchRepository
                .findByMedicineIdAndDeletedAtIsNullOrderByExpiryDateAscReceivedAtAsc(medicineId);
        List<MedicineBatchResponse> batchResponses = batches.stream()
                .map(b -> toBatchResponse(b, medicine.getName()))
                .toList();

        return MedicineStockSummaryResponse.builder()
                .medicineId(medicine.getId())
                .medicineName(medicine.getName())
                .medicineCode(medicine.getCode())
                .quantityOnHand(batchRepository.sumOnHand(medicineId))
                .batches(batchResponses)
                .build();
    }

    /**
     * Decrement FEFO stock when a pharmacy request is dispensed. Soft-fails if no medicine_id / no stock.
     */
    @Transactional
    public void decrementForDispense(UserPrincipal principal, PharmacyRequestEntity request) {
        List<PharmacyRequestItemEntity> items = requestItemRepository
                .findByPharmacyRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(request.getId());
        for (PharmacyRequestItemEntity item : items) {
            if (item.getMedicineId() == null) {
                continue;
            }
            int needed = item.getQuantityDispensed() > 0
                    ? item.getQuantityDispensed()
                    : Math.max(1, item.getQuantityRequested());
            List<MedicineBatchEntity> batches = batchRepository
                    .findByMedicineIdAndDeletedAtIsNullOrderByExpiryDateAscReceivedAtAsc(item.getMedicineId());
            int remaining = needed;
            for (MedicineBatchEntity batch : batches) {
                if (remaining <= 0) {
                    break;
                }
                int take = Math.min(batch.getQuantityOnHand(), remaining);
                if (take <= 0) {
                    continue;
                }
                batch.setQuantityOnHand(batch.getQuantityOnHand() - take);
                batch.setUpdatedBy(principal.getUserId());
                batch.touch();
                batchRepository.save(batch);

                MedicineEntity medicine = medicineRepository.findById(item.getMedicineId()).orElse(null);
                if (medicine != null) {
                    recordTxn(principal, medicine, batch.getId(), "DISPENSE", -take,
                            "PharmacyRequest", request.getId(),
                            "Dispense " + item.getMedicineName());
                }
                remaining -= take;
            }
            if (remaining > 0) {
                // Allow dispense without full stock (legacy / untracked catalogue) — audit only
                auditLogService.record(principal.getTenantId(), principal.getUserId(),
                        "PHARMACY_STOCK_SHORTFALL", "PharmacyRequest", request.getId(),
                        Map.of("medicineId", item.getMedicineId(), "shortfall", remaining));
            }
        }
    }

    private void recordTxn(
            UserPrincipal principal,
            MedicineEntity medicine,
            UUID batchId,
            String type,
            int quantity,
            String refType,
            UUID refId,
            String notes) {
        StockTransactionEntity txn = new StockTransactionEntity();
        txn.setTenantId(principal.getTenantId());
        txn.setHospitalId(medicine.getHospitalId());
        txn.setBranchId(medicine.getBranchId());
        txn.setMedicineId(medicine.getId());
        txn.setBatchId(batchId);
        txn.setTxnType(type);
        txn.setQuantity(quantity);
        txn.setReferenceType(refType);
        txn.setReferenceId(refId);
        txn.setNotes(notes);
        txn.setCreatedBy(principal.getUserId());
        stockTransactionRepository.save(txn);
    }

    private MedicineBatchResponse toBatchResponse(MedicineBatchEntity batch, String medicineName) {
        return MedicineBatchResponse.builder()
                .batchId(batch.getId())
                .medicineId(batch.getMedicineId())
                .medicineName(medicineName)
                .batchNumber(batch.getBatchNumber())
                .expiryDate(batch.getExpiryDate())
                .quantityOnHand(batch.getQuantityOnHand())
                .unitCost(batch.getUnitCost())
                .receivedAt(batch.getReceivedAt())
                .build();
    }
}
