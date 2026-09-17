package com.health360.predictive.application.service;

import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictiveInsightScheduler {

    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final FeatureAccessService featureAccessService;
    private final PredictiveInsightService predictiveInsightService;

    /** Every 15 minutes: refresh predictive insights for hospitals with FEATURE_PREDICTIVE_OPS. */
    @Scheduled(fixedRate = 900_000)
    public void refreshPredictiveInsights() {
        List<HospitalEntity> hospitals = hospitalRepository.findAll(PageRequest.of(0, 200)).getContent();
        int refreshed = 0;
        for (HospitalEntity hospital : hospitals) {
            if (hospital.getDeletedAt() != null) {
                continue;
            }
            if (!featureAccessService.hasFeature(
                    hospital.getId(), hospital.getTenantId(), PlanFeatureKeys.FEATURE_PREDICTIVE_OPS)) {
                continue;
            }
            List<BranchEntity> branches = branchRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(
                    hospital.getId());
            for (BranchEntity branch : branches) {
                try {
                    predictiveInsightService.refreshInternal(
                            hospital.getTenantId(),
                            hospital.getId(),
                            branch.getId(),
                            hospital.getAdminUserId());
                    refreshed++;
                } catch (Exception ex) {
                    log.warn("Predictive refresh failed for hospital {} branch {}: {}",
                            hospital.getId(), branch.getId(), ex.getMessage());
                }
            }
        }
        if (refreshed > 0) {
            log.info("Predictive insights refreshed for {} branch scope(s)", refreshed);
        }
    }
}
