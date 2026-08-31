package com.health360.patient.application.service;

import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates patient profile + tenant-global UHID when a person joins via the patient app.
 */
@Service
@RequiredArgsConstructor
public class PatientRegistrationProvisioner {

    private final PlatformPatientLookupService platformPatientLookupService;
    private final PatientUhidAssignmentService patientUhidAssignmentService;

    @Transactional
    public PatientProfileEntity provisionForNewAppUser(UserEntity user) {
        PatientProfileEntity profile = platformPatientLookupService.ensureProfileForAppUser(user, user.getId());
        return patientUhidAssignmentService.ensureAssigned(profile, user.getId(), "APP_REGISTRATION");
    }
}
