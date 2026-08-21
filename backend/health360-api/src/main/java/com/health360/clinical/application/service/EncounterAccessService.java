package com.health360.clinical.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.config.security.UserPrincipal;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EncounterAccessService {

    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final HospitalRepository hospitalRepository;

    public void assertCanReadEncounter(UserPrincipal principal, EncounterEntity encounter) {
        if (principal.hasPermission("clinical:encounter:write")) {
            return;
        }
        if (principal.hasPermission("clinical:encounter:read")) {
            assertPatientOwnsEncounter(principal, encounter);
            return;
        }
        throw forbidden();
    }

    public void assertCanWriteEncounter(UserPrincipal principal, EncounterEntity encounter) {
        if (!principal.hasPermission("clinical:encounter:write")) {
            throw forbidden();
        }
        if (principal.getRoles().contains("HOSPITAL_ADMIN")) {
            assertHospitalAdminScope(principal, encounter.getHospitalId());
        }
    }

    public void assertCanReadVitals(UserPrincipal principal, EncounterEntity encounter) {
        if (!principal.hasPermission("clinical:vitals:read")
                && !principal.hasPermission("clinical:vitals:write")) {
            throw forbidden();
        }
        if (principal.getRoles().contains("HOSPITAL_ADMIN")) {
            assertHospitalAdminScope(principal, encounter.getHospitalId());
        }
    }

    public void assertCanWriteVitals(UserPrincipal principal, EncounterEntity encounter) {
        if (!principal.hasPermission("clinical:vitals:write")) {
            throw forbidden();
        }
        if (principal.getRoles().contains("HOSPITAL_ADMIN")) {
            assertHospitalAdminScope(principal, encounter.getHospitalId());
        }
    }

    public void assertCanReadClinicalTimeline(UserPrincipal principal) {
        if (!principal.hasPermission("clinical:timeline:read")) {
            throw forbidden();
        }
    }

    public PatientProfileEntity requirePatient(UUID tenantId, UUID patientId) {
        return patientProfileRepository.findById(patientId)
                .filter(p -> p.getDeletedAt() == null && p.getTenantId().equals(tenantId))
                .orElseThrow(() -> notFound("Patient not found"));
    }

    public DoctorProfileEntity requireDoctor(UUID tenantId, UUID doctorId) {
        return doctorProfileRepository.findById(doctorId)
                .filter(d -> d.getDeletedAt() == null && d.getTenantId().equals(tenantId))
                .orElseThrow(() -> notFound("Doctor not found"));
    }

    public HospitalEntity requireHospital(UUID tenantId, UUID hospitalId) {
        return hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId)
                .orElseThrow(() -> notFound("Hospital not found"));
    }

    public UUID resolvePatientProfileIdForUser(UUID userId, UUID tenantId) {
        return patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId)
                .map(PatientProfileEntity::getId)
                .orElse(null);
    }

    public UUID resolveDoctorProfileIdForUser(UUID userId, UUID tenantId) {
        return doctorProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId)
                .map(DoctorProfileEntity::getId)
                .orElse(null);
    }

    private void assertPatientOwnsEncounter(UserPrincipal principal, EncounterEntity encounter) {
        UUID patientProfileId = resolvePatientProfileIdForUser(principal.getUserId(), principal.getTenantId());
        if (patientProfileId == null || !patientProfileId.equals(encounter.getPatientId())) {
            throw forbidden();
        }
    }

    public void assertHospitalAdminScope(UserPrincipal principal, UUID hospitalId) {
        HospitalEntity hospital = requireHospital(principal.getTenantId(), hospitalId);
        if (!hospital.getAdminUserId().equals(principal.getUserId())) {
            throw forbidden();
        }
    }

    private BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
    }

    private BusinessException notFound(String message) {
        return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }
}
