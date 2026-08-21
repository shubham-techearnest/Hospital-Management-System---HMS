package com.health360.opd.application.service;

import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.clinical.presentation.dto.response.EncounterResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.opd.domain.OpdRegistrationType;
import com.health360.opd.domain.QueueEntryStatus;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.opd.presentation.dto.request.CheckInAppointmentRequest;
import com.health360.opd.presentation.dto.request.WalkInRegistrationRequest;
import com.health360.opd.presentation.dto.response.OpdQueueEntryResponse;
import com.health360.opd.presentation.dto.response.OpdRegistrationResponse;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.scheduling.presentation.dto.response.AppointmentArrivalResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OpdRegistrationService {

    private static final Set<String> CHECK_IN_APPOINTMENT_STATUSES =
            Set.of("PENDING", "CONFIRMED", "POSTPONED", "ARRIVED");

    private final AppointmentRepository appointmentRepository;
    private final EncounterRepository encounterRepository;
    private final OpdQueueEntryRepository queueEntryRepository;
    private final EncounterService encounterService;
    private final OpdDeskService deskService;
    private final OpdAccessService opdAccessService;
    private final OpdMapper opdMapper;
    private final AuditLogService auditLogService;
    private final PatientProfileRepository patientProfileRepository;

    @Transactional
    public OpdRegistrationResponse checkInAppointment(
            UserPrincipal principal, CheckInAppointmentRequest request) {
        AppointmentArrivalResponse arrival = arriveAppointment(principal, request);
        return OpdRegistrationResponse.builder()
                .queueEntry(arrival.getQueueEntry())
                .encounter(arrival.getEncounter())
                .appointmentId(arrival.getAppointmentId())
                .appointmentStatus(arrival.getAppointmentStatus())
                .build();
    }

    /**
     * Shared arrive/check-in path (P2-F1). Sets appointment ARRIVED and syncs encounter + queue.
     */
    @Transactional
    public AppointmentArrivalResponse arriveAppointment(
            UserPrincipal principal, CheckInAppointmentRequest request) {
        opdAccessService.assertCanManageRegistration(principal);

        UUID tenantId = principal.getTenantId();
        AppointmentEntity appointment = appointmentRepository
                .findByIdForUpdate(request.getAppointmentId())
                .filter(a -> a.getTenantId().equals(tenantId) && a.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Appointment not found"));

        opdAccessService.assertHospitalScope(principal, appointment.getHospitalId());

        if (!CHECK_IN_APPOINTMENT_STATUSES.contains(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Appointment is not eligible for arrival");
        }

        if (request.getDeskId() != null) {
            deskService.requireActiveDesk(tenantId, request.getDeskId(),
                    appointment.getHospitalId(), appointment.getBranchId());
        }

        boolean newlyArrived = !"ARRIVED".equals(appointment.getStatus());
        if (newlyArrived) {
            appointment.setStatus("ARRIVED");
            appointment.setUpdatedBy(principal.getUserId());
            appointment.touch();
            appointmentRepository.save(appointment);
        }

        EncounterEntity existingEncounter = encounterRepository
                .findByTenantIdAndAppointmentIdAndDeletedAtIsNull(tenantId, appointment.getId())
                .orElse(null);

        EncounterResponse encounterResponse;
        OpdQueueEntryEntity queueEntry;

        if (existingEncounter != null) {
            encounterResponse = encounterService.markWaitingForRegistration(principal, existingEncounter.getId());
            queueEntry = queueEntryRepository
                    .findByTenantIdAndEncounterIdAndDeletedAtIsNull(tenantId, existingEncounter.getId())
                    .or(() -> queueEntryRepository.findByTenantIdAndAppointmentIdAndDeletedAtIsNull(
                            tenantId, appointment.getId()))
                    .orElseGet(() -> createQueueEntry(
                            principal,
                            existingEncounter.getId(),
                            appointment.getHospitalId(),
                            appointment.getBranchId(),
                            request.getDeskId(),
                            appointment.getId(),
                            OpdRegistrationType.APPOINTMENT,
                            request.getPriority()));
        } else {
            CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
            encounterRequest.setPatientId(appointment.getPatientId());
            encounterRequest.setHospitalId(appointment.getHospitalId());
            encounterRequest.setBranchId(appointment.getBranchId());
            encounterRequest.setPrimaryDoctorId(appointment.getDoctorId());
            encounterRequest.setAppointmentId(appointment.getId());
            encounterRequest.setEncounterType("OPD");
            encounterRequest.setVisitReason(appointment.getReasonForVisit());

            encounterResponse = encounterService.createEncounterForRegistration(principal, encounterRequest);
            encounterResponse = encounterService.markWaitingForRegistration(
                    principal, encounterResponse.getEncounterId());

            queueEntry = createQueueEntry(
                    principal,
                    encounterResponse.getEncounterId(),
                    appointment.getHospitalId(),
                    appointment.getBranchId(),
                    request.getDeskId(),
                    appointment.getId(),
                    OpdRegistrationType.APPOINTMENT,
                    request.getPriority());
        }

        EncounterEntity encounterEntity = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounterResponse.getEncounterId(), tenantId)
                .orElseThrow();

        OpdQueueEntryResponse queueResponse = opdMapper.toQueueEntryResponse(
                queueEntry, encounterEntity, encounterResponse);

        if (newlyArrived) {
            auditLogService.record(tenantId, principal.getUserId(), "APPOINTMENT_ARRIVED", "Appointment",
                    appointment.getId(),
                    Map.of(
                            "encounterId", encounterResponse.getEncounterId().toString(),
                            "queueEntryId", queueEntry.getId().toString(),
                            "token", queueEntry.getTokenDisplay()));
        }

        auditLogService.record(tenantId, principal.getUserId(), "OPD_APPOINTMENT_CHECKED_IN",
                "OpdQueueEntry", queueEntry.getId(),
                Map.of("appointmentId", appointment.getId().toString(),
                        "appointmentStatus", appointment.getStatus(),
                        "token", queueEntry.getTokenDisplay()));

        return AppointmentArrivalResponse.builder()
                .appointmentId(appointment.getId())
                .appointmentStatus(appointment.getStatus())
                .encounter(encounterResponse)
                .queueEntry(queueResponse)
                .build();
    }

    @Transactional
    public OpdRegistrationResponse registerWalkIn(
            UserPrincipal principal, WalkInRegistrationRequest request) {
        opdAccessService.assertCanManageRegistration(principal);
        opdAccessService.assertHospitalScope(principal, request.getHospitalId());

        UUID tenantId = principal.getTenantId();
        UUID patientId = resolvePatientId(tenantId, request);

        if (request.getDeskId() != null) {
            deskService.requireActiveDesk(tenantId, request.getDeskId(),
                    request.getHospitalId(), request.getBranchId());
        }

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(patientId);
        encounterRequest.setHospitalId(request.getHospitalId());
        encounterRequest.setBranchId(request.getBranchId());
        encounterRequest.setDepartmentId(request.getDepartmentId());
        encounterRequest.setPrimaryDoctorId(request.getPrimaryDoctorId());
        encounterRequest.setEncounterType("OPD");
        encounterRequest.setVisitReason(request.getVisitReason());

        EncounterResponse encounterResponse = encounterService.createEncounterForRegistration(principal, encounterRequest);
        encounterResponse = encounterService.markWaitingForRegistration(
                principal, encounterResponse.getEncounterId());

        OpdQueueEntryEntity queueEntry = createQueueEntry(
                principal,
                encounterResponse.getEncounterId(),
                request.getHospitalId(),
                request.getBranchId(),
                request.getDeskId(),
                null,
                OpdRegistrationType.WALK_IN,
                request.getPriority());

        EncounterEntity encounterEntity = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounterResponse.getEncounterId(), tenantId)
                .orElseThrow();

        OpdQueueEntryResponse queueResponse = opdMapper.toQueueEntryResponse(
                queueEntry, encounterEntity, encounterResponse);

        auditLogService.record(tenantId, principal.getUserId(), "OPD_WALK_IN_REGISTERED",
                "OpdQueueEntry", queueEntry.getId(),
                Map.of("patientId", patientId.toString(),
                        "token", queueEntry.getTokenDisplay()));

        return OpdRegistrationResponse.builder()
                .queueEntry(queueResponse)
                .encounter(encounterResponse)
                .build();
    }

    private UUID resolvePatientId(UUID tenantId, WalkInRegistrationRequest request) {
        if (request.getPatientId() != null) {
            PatientProfileEntity profile = patientProfileRepository.findById(request.getPatientId())
                    .filter(p -> p.getDeletedAt() == null && p.getTenantId().equals(tenantId))
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Patient not found"));
            return profile.getId();
        }
        if (request.getPatientUhid() != null && !request.getPatientUhid().isBlank()) {
            String uhid = request.getPatientUhid().trim().toUpperCase();
            return patientProfileRepository.findByTenantIdAndUhidAndDeletedAtIsNull(tenantId, uhid)
                    .map(PatientProfileEntity::getId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "No patient found for UHID " + uhid
                                    + ". Search/register the patient first, then walk-in."));
        }
        throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                "Provide patientId (UUID) or patientUhid (e.g. H360-2026-00000001)");
    }

    private OpdQueueEntryEntity createQueueEntry(
            UserPrincipal principal,
            UUID encounterId,
            UUID hospitalId,
            UUID branchId,
            UUID deskId,
            UUID appointmentId,
            OpdRegistrationType registrationType,
            Integer priority) {

        UUID tenantId = principal.getTenantId();
        LocalDate queueDate = LocalDate.now(ZoneId.systemDefault());

        int nextToken = queueEntryRepository.findMaxTokenNumberForDay(hospitalId, branchId, queueDate) + 1;
        String tokenDisplay = String.format("%03d", nextToken);

        OpdQueueEntryEntity entry = new OpdQueueEntryEntity();
        entry.setTenantId(tenantId);
        entry.setEncounterId(encounterId);
        entry.setHospitalId(hospitalId);
        entry.setBranchId(branchId);
        entry.setDeskId(deskId);
        entry.setAppointmentId(appointmentId);
        entry.setRegistrationType(registrationType.name());
        entry.setTokenNumber(nextToken);
        entry.setTokenDisplay(tokenDisplay);
        entry.setQueueDate(queueDate);
        entry.setStatus(QueueEntryStatus.WAITING.name());
        entry.setPriority(priority != null ? priority : 0);
        entry.setCheckedInAt(Instant.now());
        entry.setCreatedBy(principal.getUserId());
        entry.setUpdatedBy(principal.getUserId());

        return queueEntryRepository.save(entry);
    }
}
