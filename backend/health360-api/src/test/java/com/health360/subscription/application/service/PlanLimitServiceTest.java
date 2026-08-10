package com.health360.subscription.application.service;

import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.domain.PlanLimitKeys;
import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanLimitEntity;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanLimitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlanLimitServiceTest {

    @Mock
    private HospitalSubscriptionService hospitalSubscriptionService;

    @Mock
    private SubscriptionPlanLimitRepository planLimitRepository;

    @Mock
    private HospitalAssociationRepository associationRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private BranchRepository branchRepository;

    @InjectMocks
    private PlanLimitService planLimitService;

    private UUID hospitalId;
    private UUID tenantId;
    private UUID planId;

    @BeforeEach
    void setUp() {
        hospitalId = UUID.randomUUID();
        tenantId = UUID.randomUUID();
        planId = UUID.fromString("00000000-0000-0000-0000-000000000080");

        HospitalSubscriptionEntity subscription = new HospitalSubscriptionEntity();
        subscription.setHospitalId(hospitalId);
        subscription.setTenantId(tenantId);
        subscription.setPlanId(planId);
        subscription.setStatus("ACTIVE");

        when(hospitalSubscriptionService.requireActiveSubscription(hospitalId, tenantId))
                .thenReturn(subscription);

        SubscriptionPlanLimitEntity limit = new SubscriptionPlanLimitEntity();
        limit.setPlanId(planId);
        limit.setLimitKey(PlanLimitKeys.MAX_DOCTORS);
        limit.setLimitValue(1);

        when(planLimitRepository.findByPlanIdAndLimitKeyAndDeletedAtIsNull(planId, PlanLimitKeys.MAX_DOCTORS))
                .thenReturn(Optional.of(limit));
    }

    @Test
    void freePlanAllowsFirstDoctor() {
        when(associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(hospitalId))
                .thenReturn(List.of());

        assertThat(planLimitService.checkDoctorLimit(hospitalId, tenantId).isAllowed()).isTrue();
    }

    @Test
    void freePlanBlocksSecondDoctor() {
        HospitalAssociationEntity existing = new HospitalAssociationEntity();
        existing.setDoctorId(UUID.randomUUID());
        existing.setHospitalId(hospitalId);
        existing.setStatus("ACTIVE");

        when(associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(hospitalId))
                .thenReturn(List.of(existing));

        assertThat(planLimitService.checkDoctorLimit(hospitalId, tenantId).isAllowed()).isFalse();

        assertThatThrownBy(() -> planLimitService.assertCanAddDoctor(hospitalId, tenantId))
                .isInstanceOf(BusinessException.class)
                .extracting("code")
                .isEqualTo(ErrorCode.DOCTOR_LIMIT_REACHED);
    }
}
