package com.health360.automation.application.service;

import com.health360.automation.infrastructure.persistence.entity.HospitalEventEntity;
import com.health360.billing.application.service.ChargePostingService;
import com.health360.facility.application.service.FacilityWorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class AutomationReactor {

    private final AutomationRulesEvaluator rulesEvaluator;
    private final ChargePostingService chargePostingService;
    private final FacilityWorkOrderService facilityWorkOrderService;

    public AutomationReactor(
            AutomationRulesEvaluator rulesEvaluator,
            ChargePostingService chargePostingService,
            @Lazy FacilityWorkOrderService facilityWorkOrderService) {
        this.rulesEvaluator = rulesEvaluator;
        this.chargePostingService = chargePostingService;
        this.facilityWorkOrderService = facilityWorkOrderService;
    }

    @Transactional
    public void onEvent(HospitalEventEntity event) {
        try {
            rulesEvaluator.evaluate(event);
        } catch (Exception ex) {
            log.warn("Automation reactor failed for event {} ({}): {}",
                    event.getId(), event.getEventType(), ex.getMessage());
        }
        try {
            chargePostingService.onHospitalEvent(event);
        } catch (Exception ex) {
            log.warn("Charge posting failed for event {} ({}): {}",
                    event.getId(), event.getEventType(), ex.getMessage());
        }
        try {
            facilityWorkOrderService.onHospitalEvent(event);
        } catch (Exception ex) {
            log.warn("Facility work-order automation failed for event {} ({}): {}",
                    event.getId(), event.getEventType(), ex.getMessage());
        }
    }
}
