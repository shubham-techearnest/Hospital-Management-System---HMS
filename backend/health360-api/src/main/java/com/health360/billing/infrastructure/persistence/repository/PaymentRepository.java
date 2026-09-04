package com.health360.billing.infrastructure.persistence.repository;

import com.health360.billing.infrastructure.persistence.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    List<PaymentEntity> findByInvoiceIdAndDeletedAtIsNullOrderByPaidAtDesc(UUID invoiceId);

    Optional<PaymentEntity> findByGatewayAndGatewayOrderIdAndDeletedAtIsNull(String gateway, String gatewayOrderId);

    Optional<PaymentEntity> findByGatewayAndGatewayPaymentIdAndDeletedAtIsNull(String gateway, String gatewayPaymentId);

    Optional<PaymentEntity> findByTenantIdAndIdempotencyKeyAndDeletedAtIsNull(UUID tenantId, String idempotencyKey);

    Optional<PaymentEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);

    Optional<PaymentEntity> findFirstByInvoiceIdAndStatusAndGatewayAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID invoiceId, String status, String gateway);
}
