package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.shared.application.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * DEC-001: UHID is tenant-global — one identifier per patient across all hospitals.
 * Hospital visits are tracked in {@code hospital_registrations}, not by issuing a new UHID.
 */
@Service
@RequiredArgsConstructor
public class PatientUhidAssignmentService {

    private final PatientProfileRepository patientProfileRepository;
    private final UhidGenerationService uhidGenerationService;
    private final AuditLogService auditLogService;

    @Transactional
    public PatientProfileEntity ensureAssigned(PatientProfileEntity profile, UUID actorUserId) {
        if (profile.getUhid() != null && !profile.getUhid().isBlank()) {
            return profile;
        }
        String uhid = uhidGenerationService.allocateUhid(profile.getTenantId());
        profile.setUhid(uhid);
        profile.setUpdatedBy(actorUserId != null ? actorUserId : profile.getUserId());
        profile.touch();
        PatientProfileEntity saved = patientProfileRepository.save(profile);

        auditLogService.record(
                profile.getTenantId(),
                actorUserId != null ? actorUserId : profile.getUserId(),
                "UHID_ASSIGNED",
                "PatientProfile",
                saved.getId(),
                Map.of("uhid", uhid, "source", "FIRST_HOSPITAL_CONTACT"));

        return saved;
    }

    public boolean hasUhid(PatientProfileEntity profile) {
        return profile.getUhid() != null && !profile.getUhid().isBlank();
    }
}
