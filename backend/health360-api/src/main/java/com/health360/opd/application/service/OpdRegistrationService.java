package com.health360.opd.application.service;

import com.health360.clinical.application.service.EncounterService;
import com.health360.clinical.domain.EncounterStatus;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.clinical.presentation.dto.request.UpdateEncounterStatusRequest;
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
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
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

    private static final Set<String> CHECK_IN_APPOINTMENT_STATUSES = Set.of("PENDING", "CONFIRMED", "POSTPONED");

    private final AppointmentRepository appointmentRepository;
    private final EncounterRepository encounterRepository;
    private final OpdQueueEntryRepository queueEntryRepository;
    private final EncounterService encounterService;
    private final OpdDeskService deskService;
    private final OpdAccessService opdAccessService;
    private final OpdMapper opdMapper;
    private final AuditLogService auditLogService;

    @Transactional
    public OpdRegistrationResponse checkInAppointment(
            UserPrincipal principal, CheckInAppointmentRequest request) {
        opdAccessService.assertCanManageRegistration(principal);

        UUID tenantId = principal.getTenantId();
        AppointmentEntity appointment = appointmentRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(request.getAppointmentId(), tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Appointment not found"));

        opdAccessService.assertHospitalScope(principal, appointment.getHospitalId());

        if (!CHECK_IN_APPOINTMENT_STATUSES.contains(appointment.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Appointment is not eligible for check-in");
        }

        if (encounterRepository.existsByTenantIdAndAppointmentIdAndDeletedAtIsNull(
                tenantId, appointment.getId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "An encounter already exists for this appointment");
        }

        if (request.getDeskId() != null) {
            deskService.requireActiveDesk(tenantId, request.getDeskId(),
                    appointment.getHospitalId(), appointment.getBranchId());
        }

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(appointment.getPatientId());
        encounterRequest.setHospitalId(appointment.getHospitalId());
        encounterRequest.setBranchId(appointment.getBranchId());
        encounterRequest.setPrimaryDoctorId(appointment.getDoctorId());
        encounterRequest.setAppointmentId(appointment.getId());
        encounterRequest.setEncounterType("OPD");
        encounterRequest.setVisitReason(appointment.getReasonForVisit());

        EncounterResponse encounterResponse = encounterService.createEncounter(principal, encounterRequest);
        encounterResponse = transitionEncounterToWaiting(principal, encounterResponse.getEncounterId());

        OpdQueueEntryEntity queueEntry = createQueueEntry(
                principal,
                encounterResponse.getEncounterId(),
                appointment.getHospitalId(),
                appointment.getBranchId(),
                request.getDeskId(),
                appointment.getId(),
                OpdRegistrationType.APPOINTMENT,
                request.getPriority());

        EncounterEntity encounterEntity = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(encounterResponse.getEncounterId(), tenantId)
                .orElseThrow();

        OpdQueueEntryResponse queueResponse = opdMapper.toQueueEntryResponse(
                queueEntry, encounterEntity, encounterResponse);

        auditLogService.record(tenantId, principal.getUserId(), "OPD_APPOINTMENT_CHECKED_IN",
                "OpdQueueEntry", queueEntry.getId(),
                Map.of("appointmentId", appointment.getId().toString(),
                        "token", queueEntry.getTokenDisplay()));

        return OpdRegistrationResponse.builder()
                .queueEntry(queueResponse)
                .encounter(encounterResponse)
                .build();
    }

    @Transactional
    public OpdRegistrationResponse registerWalkIn(
            UserPrincipal principal, WalkInRegistrationRequest request) {
        opdAccessService.assertCanManageRegistration(principal);
        opdAccessService.assertHospitalScope(principal, request.getHospitalId());

        UUID tenantId = principal.getTenantId();

        if (request.getDeskId() != null) {
            deskService.requireActiveDesk(tenantId, request.getDeskId(),
                    request.getHospitalId(), request.getBranchId());
        }

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(request.getPatientId());
        encounterRequest.setHospitalId(request.getHospitalId());
        encounterRequest.setBranchId(request.getBranchId());
        encounterRequest.setDepartmentId(request.getDepartmentId());
        encounterRequest.setPrimaryDoctorId(request.getPrimaryDoctorId());
        encounterRequest.setEncounterType("OPD");
        encounterRequest.setVisitReason(request.getVisitReason());

        EncounterResponse encounterResponse = encounterService.createEncounter(principal, encounterRequest);
        encounterResponse = transitionEncounterToWaiting(principal, encounterResponse.getEncounterId());

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
                Map.of("patientId", request.getPatientId().toString(),
                        "token", queueEntry.getTokenDisplay()));

        return OpdRegistrationResponse.builder()
                .queueEntry(queueResponse)
                .encounter(encounterResponse)
                .build();
    }

    private EncounterResponse transitionEncounterToWaiting(UserPrincipal principal, UUID encounterId) {
        UpdateEncounterStatusRequest statusRequest = new UpdateEncounterStatusRequest();
        statusRequest.setStatus(EncounterStatus.WAITING.name());
        return encounterService.updateEncounterStatus(principal, encounterId, statusRequest);
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
