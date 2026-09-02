package com.health360.opd.application.service;

import com.health360.billing.domain.InvoiceStatus;
import com.health360.billing.infrastructure.persistence.entity.InvoiceEntity;
import com.health360.billing.infrastructure.persistence.repository.InvoiceRepository;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.config.security.UserPrincipal;
import com.health360.doctor.application.service.DoctorDisplayNameResolver;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
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
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OpdPatientStatusService {

    private final OpdQueueEntryRepository queueEntryRepository;
    private final PatientProfileService patientProfileService;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final DoctorDisplayNameResolver doctorDisplayNameResolver;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public List<PatientOpdVisitStatusResponse> getMyTodayVisits(UserPrincipal principal) {
        PatientProfileEntity patient = patientProfileService.requireProfileForAppointmentAccess(
                principal.getUserId(), principal.getTenantId());
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        UUID tenantId = principal.getTenantId();

        List<Object[]> rows = queueEntryRepository.findTodayVisitsForPatient(tenantId, patient.getId(), today);
        List<UUID> encounterIds = rows.stream()
                .map(row -> ((EncounterEntity) row[1]).getId())
                .toList();

        Map<UUID, String> invoiceStatusByEncounter = encounterIds.isEmpty()
                ? Map.of()
                : invoiceRepository
                        .findActiveByTenantAndEncounters(
                                tenantId, encounterIds, InvoiceStatus.CANCELLED.name())
                        .stream()
                        .collect(Collectors.toMap(
                                InvoiceEntity::getEncounterId, InvoiceEntity::getStatus, (left, right) -> left));

        return rows.stream()
                .map(row -> toResponse(row, invoiceStatusByEncounter))
                .toList();
    }

    private PatientOpdVisitStatusResponse toResponse(Object[] row, Map<UUID, String> invoiceStatusByEncounter) {
        OpdQueueEntryEntity entry = (OpdQueueEntryEntity) row[0];
        EncounterEntity encounter = (EncounterEntity) row[1];
        Integer queuePosition = null;
        if ("WAITING".equals(entry.getStatus())) {
            long ahead = queueEntryRepository.countWaitingAhead(
                    entry.getTenantId(),
                    entry.getHospitalId(),
                    entry.getBranchId(),
                    entry.getQueueDate(),
                    entry.getTokenNumber());
            queuePosition = (int) ahead + 1;
        }

        String hospitalName = hospitalRepository.findById(entry.getHospitalId())
                .map(h -> h.getName())
                .orElse(null);
        String branchName = entry.getBranchId() != null
                ? branchRepository.findById(entry.getBranchId()).map(b -> b.getName()).orElse(null)
                : null;

        return PatientOpdVisitStatusResponse.builder()
                .queueEntryId(entry.getId())
                .tokenDisplay(entry.getTokenDisplay())
                .tokenNumber(entry.getTokenNumber())
                .queuePosition(queuePosition)
                .status(entry.getStatus())
                .hospitalId(entry.getHospitalId())
                .hospitalName(hospitalName)
                .branchId(entry.getBranchId())
                .branchName(branchName)
                .encounterId(entry.getEncounterId())
                .encounterNumber(encounter.getEncounterNumber())
                .encounterStatus(encounter.getStatus())
                .primaryDoctorId(encounter.getPrimaryDoctorId())
                .primaryDoctorName(doctorDisplayNameResolver.resolve(encounter.getPrimaryDoctorId()))
                .checkedInAt(entry.getCheckedInAt())
                .calledAt(entry.getCalledAt())
                .serviceStartedAt(entry.getServiceStartedAt())
                .completedAt(entry.getCompletedAt())
                .invoiceStatus(invoiceStatusByEncounter.get(entry.getEncounterId()))
                .build();
    }
}
