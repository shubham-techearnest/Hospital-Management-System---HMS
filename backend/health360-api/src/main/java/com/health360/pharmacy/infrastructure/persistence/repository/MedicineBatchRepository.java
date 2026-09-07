package com.health360.pharmacy.infrastructure.persistence.repository;

import com.health360.pharmacy.infrastructure.persistence.entity.MedicineBatchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicineBatchRepository extends JpaRepository<MedicineBatchEntity, UUID> {

    List<MedicineBatchEntity> findByMedicineIdAndDeletedAtIsNullOrderByExpiryDateAscReceivedAtAsc(UUID medicineId);

    Optional<MedicineBatchEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    @Query("""
            SELECT COALESCE(SUM(b.quantityOnHand), 0) FROM MedicineBatchEntity b
            WHERE b.medicineId = :medicineId AND b.deletedAt IS NULL
            """)
    int sumOnHand(@Param("medicineId") UUID medicineId);
}
