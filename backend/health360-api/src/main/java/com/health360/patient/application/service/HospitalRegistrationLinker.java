package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.HospitalRegistrationEntity;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.HospitalRegistrationRepository;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Idempotent link of a tenant-global patient profile to a hospital campus.
 */
@Component
@RequiredArgsConstructor
public class HospitalRegistrationLinker {

    private final HospitalRegistrationRepository hospitalRegistrationRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PatientUhidAssignmentService patientUhidAssignmentService;

    @Transactional
    public void ensureLinked(UUID tenantId, UUID patientId, UUID hospitalId, UUID branchId, UUID actorUserId) {
        if (findRegistration(patientId, hospitalId, branchId).isPresent()) {
            return;
        }

        PatientProfileEntity profile = patientProfileRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(patientId, tenantId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Patient not found"));

        profile = patientUhidAssignmentService.ensureAssigned(profile, actorUserId);

        HospitalRegistrationEntity registration = new HospitalRegistrationEntity();
        registration.setTenantId(tenantId);
        registration.setPatientId(profile.getId());
        registration.setHospitalId(hospitalId);
        registration.setBranchId(branchId);
        registration.setRegisteredAt(Instant.now());
        registration.setRegisteredBy(actorUserId);
        registration.setRegistrationNumber(profile.getUhid());
        registration.setCreatedBy(actorUserId);
        registration.setUpdatedBy(actorUserId);
        hospitalRegistrationRepository.save(registration);
    }

    public java.util.Optional<HospitalRegistrationEntity> findRegistration(
            UUID patientId, UUID hospitalId, UUID branchId) {
        if (branchId != null) {
            return hospitalRegistrationRepository.findByPatientIdAndHospitalIdAndBranchIdAndDeletedAtIsNull(
                    patientId, hospitalId, branchId);
        }
        return hospitalRegistrationRepository.findByPatientIdAndHospitalIdAndBranchIdIsNullAndDeletedAtIsNull(
                patientId, hospitalId);
    }
}
