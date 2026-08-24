package com.health360.opd.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.config.security.UserPrincipal;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.opd.presentation.dto.response.PatientOpdVisitStatusResponse;
import com.health360.patient.application.service.PatientProfileService;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OpdPatientStatusService {

    private final OpdQueueEntryRepository queueEntryRepository;
    private final PatientProfileService patientProfileService;

    @Transactional(readOnly = true)
    public List<PatientOpdVisitStatusResponse> getMyTodayVisits(UserPrincipal principal) {
        PatientProfileEntity patient = patientProfileService.requireProfileForAppointmentAccess(
                principal.getUserId(), principal.getTenantId());
        LocalDate today = LocalDate.now(ZoneId.systemDefault());

        return queueEntryRepository
                .findTodayVisitsForPatient(principal.getTenantId(), patient.getId(), today)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private PatientOpdVisitStatusResponse toResponse(Object[] row) {
        OpdQueueEntryEntity entry = (OpdQueueEntryEntity) row[0];
        EncounterEntity encounter = (EncounterEntity) row[1];
        return PatientOpdVisitStatusResponse.builder()
                .queueEntryId(entry.getId())
                .tokenDisplay(entry.getTokenDisplay())
                .tokenNumber(entry.getTokenNumber())
                .status(entry.getStatus())
                .hospitalId(entry.getHospitalId())
                .branchId(entry.getBranchId())
                .encounterId(entry.getEncounterId())
                .encounterStatus(encounter.getStatus())
                .primaryDoctorId(encounter.getPrimaryDoctorId())
                .checkedInAt(entry.getCheckedInAt())
                .calledAt(entry.getCalledAt())
                .serviceStartedAt(entry.getServiceStartedAt())
                .completedAt(entry.getCompletedAt())
                .build();
    }
}
