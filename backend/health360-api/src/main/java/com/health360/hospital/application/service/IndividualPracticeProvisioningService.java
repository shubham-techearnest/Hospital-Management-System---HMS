package com.health360.hospital.application.service;

import com.health360.doctor.application.service.DoctorProfileProvisioningService;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.iam.infrastructure.persistence.entity.RoleEntity;
import com.health360.iam.infrastructure.persistence.entity.UserRoleEntity;
import com.health360.iam.infrastructure.persistence.repository.RoleRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRoleRepository;
import com.health360.shared.application.AuditLogService;
import com.health360.subscription.application.service.HospitalSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IndividualPracticeProvisioningService {

    private final HospitalRepository hospitalRepository;
    private final HospitalAssociationRepository associationRepository;
    private final DoctorProfileProvisioningService doctorProfileProvisioningService;
    private final HospitalSubscriptionService hospitalSubscriptionService;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public void provision(UUID userId, UUID tenantId, String clinicName) {
        if (hospitalRepository.findByTenantIdAndAdminUserIdAndDeletedAtIsNull(tenantId, userId).isPresent()) {
            return;
        }

        String registrationNumber = "IP-" + userId.toString().substring(0, 8).toUpperCase();

        HospitalEntity hospital = new HospitalEntity();
        hospital.setTenantId(tenantId);
        hospital.setAdminUserId(userId);
        hospital.setName(clinicName.trim());
        hospital.setRegistrationNumber(registrationNumber);
        hospital.setHospitalType("CLINIC");
        hospital.setStatus("ACTIVE");
        hospital.setDescription("Individual practice / solo clinic");
        hospital.setCreatedBy(userId);
        hospital.setUpdatedBy(userId);
        hospital = hospitalRepository.save(hospital);

        hospitalSubscriptionService.assignInitialPlan(
                hospital.getId(), tenantId, HospitalSubscriptionService.DEFAULT_FREE_PLAN_CODE,
                userId, "Individual practice registration");

        assignRoleIfMissing(userId, tenantId, "HOSPITAL_ADMIN");

        DoctorProfileEntity doctor = doctorProfileProvisioningService.ensureProfileEntity(userId, tenantId);

        HospitalAssociationEntity association = new HospitalAssociationEntity();
        association.setTenantId(tenantId);
        association.setDoctorId(doctor.getId());
        association.setHospitalId(hospital.getId());
        association.setStatus("ACTIVE");
        association.setCreatedBy(userId);
        association.setUpdatedBy(userId);
        associationRepository.save(association);

        auditLogService.record(tenantId, userId, "INDIVIDUAL_PRACTICE_PROVISIONED", "Hospital",
                hospital.getId(), Map.of("clinicName", clinicName, "doctorId", doctor.getId()));
    }

    private void assignRoleIfMissing(UUID userId, UUID tenantId, String roleName) {
        if (userRoleRepository.findRoleNamesByUserId(userId).contains(roleName)) {
            return;
        }
        RoleEntity role = roleRepository.findByTenantIdAndName(tenantId, roleName).orElseThrow();
        UserRoleEntity userRole = new UserRoleEntity();
        userRole.setTenantId(tenantId);
        userRole.setUserId(userId);
        userRole.setRoleId(role.getId());
        userRoleRepository.save(userRole);
    }
}
