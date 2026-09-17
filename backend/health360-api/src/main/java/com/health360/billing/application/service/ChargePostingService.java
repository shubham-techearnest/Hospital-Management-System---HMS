package com.health360.billing.application.service;

import com.health360.automation.infrastructure.persistence.entity.HospitalEventEntity;
import com.health360.billing.infrastructure.persistence.entity.ChargeExceptionEntity;
import com.health360.billing.infrastructure.persistence.entity.ChargePostingEntity;
import com.health360.billing.infrastructure.persistence.entity.PriceListItemEntity;
import com.health360.billing.infrastructure.persistence.entity.ServiceCatalogItemEntity;
import com.health360.billing.infrastructure.persistence.repository.ChargeExceptionRepository;
import com.health360.billing.infrastructure.persistence.repository.ChargePostingRepository;
import com.health360.billing.infrastructure.persistence.repository.PriceListItemRepository;
import com.health360.billing.infrastructure.persistence.repository.ServiceCatalogItemRepository;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChargePostingService {

    private final ServiceCatalogItemRepository catalogRepository;
    private final PriceListItemRepository priceRepository;
    private final ChargePostingRepository postingRepository;
    private final ChargeExceptionRepository exceptionRepository;
    private final FeatureAccessService featureAccessService;

    @Value("${health360.charge.mode:DRY_RUN}")
    private String chargeMode;

    @Transactional
    public void onHospitalEvent(HospitalEventEntity event) {
        if (event.getHospitalId() == null || event.getEventType() == null) {
            return;
        }
        try {
            if (!featureAccessService.hasFeature(
                    event.getHospitalId(), event.getTenantId(), PlanFeatureKeys.FEATURE_CHARGE_ENGINE)) {
                return;
            }
        } catch (Exception ex) {
            log.debug("Charge engine feature check skipped: {}", ex.getMessage());
            return;
        }

        List<ServiceCatalogItemEntity> items = catalogRepository
                .findByTenantIdAndTriggerEventTypeAndActiveTrueAndDeletedAtIsNull(
                        event.getTenantId(), event.getEventType());
        if (items.isEmpty()) {
            return;
        }

        String mode = normalizeMode(chargeMode);
        for (ServiceCatalogItemEntity item : items) {
            postForCatalogItem(event, item, mode);
        }
    }

    private void postForCatalogItem(HospitalEventEntity event, ServiceCatalogItemEntity item, String mode) {
        if (event.getId() != null
                && postingRepository.existsBySourceEventIdAndCatalogCodeAndDeletedAtIsNull(
                        event.getId(), item.getCode())) {
            return;
        }

        List<PriceListItemEntity> prices = priceRepository.findCurrentPrice(
                event.getHospitalId(), item.getId(), LocalDate.now());
        if (prices == null || prices.isEmpty()) {
            openException(event, "PRICE_MISSING",
                    "No active price for catalog code " + item.getCode() + " at hospital " + event.getHospitalId());
            return;
        }

        PriceListItemEntity price = prices.get(0);
        BigDecimal qty = BigDecimal.ONE;
        BigDecimal unit = price.getUnitPrice() != null ? price.getUnitPrice() : BigDecimal.ZERO;
        BigDecimal total = unit.multiply(qty).setScale(2, RoundingMode.HALF_UP);

        ChargePostingEntity posting = new ChargePostingEntity();
        posting.setTenantId(event.getTenantId());
        posting.setHospitalId(event.getHospitalId());
        posting.setBranchId(event.getBranchId());
        posting.setPatientId(event.getPatientId());
        posting.setEncounterId(event.getEncounterId());
        posting.setCatalogItemId(item.getId());
        posting.setCatalogCode(item.getCode());
        posting.setDescription(item.getName());
        posting.setQuantity(qty);
        posting.setUnitPrice(unit);
        posting.setLineTotal(total);
        posting.setCurrency(price.getCurrency() != null ? price.getCurrency() : "INR");
        posting.setSourceEventId(event.getId());
        posting.setSourceEventType(event.getEventType());
        posting.setSourceEntityType(event.getEntityType());
        posting.setSourceEntityId(event.getEntityId());
        posting.setMode(mode);
        posting.setStatus("DRY_RUN".equals(mode) ? "DRY_RUN" : "POSTED");
        posting.setCreatedBy(event.getUserId());
        posting.setUpdatedBy(event.getUserId());
        postingRepository.save(posting);
    }

    private void openException(HospitalEventEntity event, String reasonCode, String message) {
        ChargeExceptionEntity ex = new ChargeExceptionEntity();
        ex.setTenantId(event.getTenantId());
        ex.setHospitalId(event.getHospitalId());
        ex.setBranchId(event.getBranchId());
        ex.setPatientId(event.getPatientId());
        ex.setEncounterId(event.getEncounterId());
        ex.setSourceEventId(event.getId());
        ex.setSourceEventType(event.getEventType());
        ex.setReasonCode(reasonCode);
        ex.setMessage(message.length() > 1000 ? message.substring(0, 1000) : message);
        ex.setStatus("OPEN");
        ex.setCreatedBy(event.getUserId());
        ex.setUpdatedBy(event.getUserId());
        exceptionRepository.save(ex);
    }

    private static String normalizeMode(String mode) {
        if (mode == null) {
            return "DRY_RUN";
        }
        String m = mode.trim().toUpperCase();
        return "POST".equals(m) ? "POST" : "DRY_RUN";
    }
}
