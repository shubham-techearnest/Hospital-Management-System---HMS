package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.SaasInvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SaasInvoiceRepository extends JpaRepository<SaasInvoiceEntity, UUID> {

    Optional<SaasInvoiceEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<SaasInvoiceEntity> findByGatewayAndGatewayOrderIdAndDeletedAtIsNull(String gateway, String gatewayOrderId);

    Optional<SaasInvoiceEntity> findByGatewayAndGatewayPaymentIdAndDeletedAtIsNull(String gateway, String gatewayPaymentId);

    List<SaasInvoiceEntity> findByHospitalIdAndTenantIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID hospitalId, UUID tenantId);

    Optional<SaasInvoiceEntity> findFirstByHospitalIdAndTenantIdAndPaymentStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID hospitalId, UUID tenantId, String paymentStatus);
}
