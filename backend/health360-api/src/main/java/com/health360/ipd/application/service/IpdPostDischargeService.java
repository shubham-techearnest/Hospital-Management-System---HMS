package com.health360.ipd.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.ipd.domain.AdmissionStatus;
import com.health360.ipd.domain.IpdServiceKeys;
import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdDischargeSummaryEntity;
import com.health360.ipd.infrastructure.persistence.repository.IpdAdmissionRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdDischargeSummaryRepository;
import com.health360.ipd.presentation.dto.request.ScheduleIpdFollowUpRequest;
import com.health360.ipd.presentation.dto.response.IpdAdmissionResponse;
import com.health360.ipd.presentation.dto.response.IpdReadmissionAnalyticsResponse;
import com.health360.ipd.presentation.dto.response.PatientIpdStayResponse;
import com.health360.scheduling.application.service.AppointmentService;
import com.health360.scheduling.presentation.dto.request.BookAppointmentRequest;
import com.health360.scheduling.presentation.dto.response.AppointmentBookingResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class IpdPostDischargeService {

    private static final Set<String> POST_DISCHARGE_STATUSES = Set.of(
            AdmissionStatus.DISCHARGED.name(),
            AdmissionStatus.FOLLOW_UP.name(),
            AdmissionStatus.LAMA.name(),
            AdmissionStatus.DAMA.name(),
            AdmissionStatus.TRANSFERRED_OUT.name()
    );

    private static final Set<String> READMIT_SOURCE_STATUSES = Set.of(
            AdmissionStatus.DISCHARGED.name(),
            AdmissionStatus.FOLLOW_UP.name(),
            AdmissionStatus.CLOSED.name(),
            AdmissionStatus.LAMA.name(),
            AdmissionStatus.DAMA.name()
    );

    private final IpdAdmissionRepository admissionRepository;
    private final IpdDischargeSummaryRepository dischargeSummaryRepository;
    private final EncounterRepository encounterRepository;
    private final AppointmentService appointmentService;
    private final IpdAccessService accessService;
    private final IpdServiceCatalogService catalogService;
    private final IpdAdmissionService admissionService;
    private final EncounterAccessService encounterAccessService;
    private final AuditLogService auditLogService;

    public IpdPostDischargeService(
            IpdAdmissionRepository admissionRepository,
            IpdDischargeSummaryRepository dischargeSummaryRepository,
            EncounterRepository encounterRepository,
            AppointmentService appointmentService,
            IpdAccessService accessService,
            IpdServiceCatalogService catalogService,
            @Lazy IpdAdmissionService admissionService,
            EncounterAccessService encounterAccessService,
            AuditLogService auditLogService) {
        this.admissionRepository = admissionRepository;
        this.dischargeSummaryRepository = dischargeSummaryRepository;
        this.encounterRepository = encounterRepository;
        this.appointmentService = appointmentService;
        this.accessService = accessService;
        this.catalogService = catalogService;
        this.admissionService = admissionService;
        this.encounterAccessService = encounterAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public IpdAdmissionResponse scheduleFollowUp(
            UserPrincipal principal, UUID admissionId, ScheduleIpdFollowUpRequest request) {
        accessService.assertCanManageAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);

        if (!POST_DISCHARGE_STATUSES.contains(admission.getStatus())
                && !AdmissionStatus.FOLLOW_UP.name().equals(admission.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Follow-up can only be scheduled after discharge");
        }
        if (admission.getFollowUpAppointmentId() != null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Follow-up appointment already linked to this admission");
        }

        BookAppointmentRequest book = new BookAppointmentRequest();
        book.setDoctorId(request.getDoctorId());
        book.setHospitalId(admission.getHospitalId());
        book.setBranchId(admission.getBranchId());
        book.setSlotId(request.getSlotId());
        book.setConsultationType("FOLLOW_UP");
        book.setPatientId(admission.getPatientId());
        book.setReasonForVisit(request.getReasonForVisit() != null
                ? request.getReasonForVisit()
                : "Post-IPD follow-up for " + admission.getAdmissionNumber());

        AppointmentBookingResponse booked = appointmentService.bookAppointment(principal, book);

        admission.setFollowUpAppointmentId(booked.getAppointmentId());
        admission.setStatus(AdmissionStatus.FOLLOW_UP.name());
        admission.setUpdatedBy(principal.getUserId());
        admission.touch();
        admissionRepository.save(admission);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_FOLLOW_UP_SCHEDULED",
                "IpdAdmission", admissionId,
                Map.of("appointmentId", booked.getAppointmentId().toString()));

        return admissionService.getAdmission(principal, admissionId);
    }

    @Transactional
    public IpdAdmissionResponse closeEpisode(UserPrincipal principal, UUID admissionId) {
        accessService.assertCanManageAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        accessService.assertAdmissionScope(principal, admission);

        if (!POST_DISCHARGE_STATUSES.contains(admission.getStatus())
                && !AdmissionStatus.FOLLOW_UP.name().equals(admission.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Only discharged / follow-up admissions can be closed");
        }
        if (AdmissionStatus.CLOSED.name().equals(admission.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Episode already closed");
        }

        admission.setStatus(AdmissionStatus.CLOSED.name());
        admission.setClosedAt(Instant.now());
        admission.setClosedBy(principal.getUserId());
        admission.setUpdatedBy(principal.getUserId());
        admission.touch();
        admissionRepository.save(admission);

        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_EPISODE_CLOSED",
                "IpdAdmission", admissionId, Map.of());

        return admissionService.getAdmission(principal, admissionId);
    }

    @Transactional(readOnly = true)
    public IpdReadmissionAnalyticsResponse readmissionAnalytics(
            UserPrincipal principal, UUID hospitalId, Instant from, Instant to) {
        accessService.assertCanReadAdmissions(principal);
        accessService.assertIpdModuleEnabled(principal, hospitalId);
        accessService.assertIpdServiceEnabled(
                principal, hospitalId, IpdServiceKeys.IPD_READMISSION_TRACKING,
                "Readmission tracking is disabled for this hospital");

        Instant rangeFrom = from != null ? from : Instant.now().minus(90, ChronoUnit.DAYS);
        Instant rangeTo = to != null ? to : Instant.now().plus(1, ChronoUnit.DAYS);
        int windowDays = resolveWindowDays(hospitalId, principal.getTenantId());

        List<IpdAdmissionEntity> rows = admissionRepository.findReadmissionsInRange(
                principal.getTenantId(), hospitalId, rangeFrom, rangeTo);

        List<IpdReadmissionAnalyticsResponse.Item> items = rows.stream()
                .map(a -> {
                    Instant priorDischargedAt = admissionRepository
                            .findByIdAndTenantIdAndDeletedAtIsNull(
                                    a.getReadmittedFromAdmissionId(), principal.getTenantId())
                            .map(IpdAdmissionEntity::getDischargedAt)
                            .orElse(null);
                    return IpdReadmissionAnalyticsResponse.Item.builder()
                            .admissionId(a.getId())
                            .priorAdmissionId(a.getReadmittedFromAdmissionId())
                            .patientId(a.getPatientId())
                            .admissionNumber(a.getAdmissionNumber())
                            .admittedAt(a.getAdmittedAt())
                            .priorDischargedAt(priorDischargedAt)
                            .build();
                })
                .toList();

        return IpdReadmissionAnalyticsResponse.builder()
                .windowDays(windowDays)
                .readmissionCount(items.size())
                .items(items)
                .build();
    }

    /** Called from admit — links prior discharge within hospital window when tracking is on. */
    @Transactional(readOnly = true)
    public UUID findPriorAdmissionForReadmit(
            UUID tenantId, UUID hospitalId, UUID patientId) {
        if (!catalogService.isServiceEnabled(hospitalId, tenantId, IpdServiceKeys.IPD_READMISSION_TRACKING)) {
            return null;
        }
        int days = resolveWindowDays(hospitalId, tenantId);
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return admissionRepository.findRecentDischargesForPatient(
                        tenantId, patientId, hospitalId, since, READMIT_SOURCE_STATUSES)
                .stream()
                .findFirst()
                .map(IpdAdmissionEntity::getId)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PatientIpdStayResponse> listMyIpdStays(UserPrincipal principal) {
        UUID patientId = encounterAccessService.resolvePatientProfileIdForUser(
                principal.getUserId(), principal.getTenantId());
        if (patientId == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                    "Patient profile not found");
        }

        return admissionRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByAdmittedAtDesc(
                        principal.getTenantId(), patientId)
                .stream()
                .filter(a -> catalogService.isServiceEnabled(
                        a.getHospitalId(), principal.getTenantId(), IpdServiceKeys.IPD_PATIENT_PORTAL))
                .map(a -> toPatientStay(principal.getTenantId(), a))
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientIpdStayResponse getMyIpdStay(UserPrincipal principal, UUID admissionId) {
        UUID patientId = encounterAccessService.resolvePatientProfileIdForUser(
                principal.getUserId(), principal.getTenantId());
        if (patientId == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                    "Patient profile not found");
        }
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        if (!admission.getPatientId().equals(patientId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        if (!catalogService.isServiceEnabled(
                admission.getHospitalId(), principal.getTenantId(), IpdServiceKeys.IPD_PATIENT_PORTAL)) {
            throw new BusinessException(ErrorCode.FEATURE_NOT_AVAILABLE, HttpStatus.FORBIDDEN,
                    "IPD patient portal summary is disabled for this hospital");
        }
        return toPatientStay(principal.getTenantId(), admission);
    }

    private PatientIpdStayResponse toPatientStay(UUID tenantId, IpdAdmissionEntity admission) {
        EncounterEntity encounter = encounterRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(admission.getEncounterId(), tenantId)
                .orElse(null);
        IpdDischargeSummaryEntity summary = dischargeSummaryRepository
                .findFirstByAdmissionIdAndDeletedAtIsNullOrderByVersionNoDesc(admission.getId())
                .orElse(null);

        return PatientIpdStayResponse.builder()
                .admissionId(admission.getId())
                .encounterId(admission.getEncounterId())
                .encounterNumber(encounter != null ? encounter.getEncounterNumber() : null)
                .admissionNumber(admission.getAdmissionNumber())
                .hospitalId(admission.getHospitalId())
                .branchId(admission.getBranchId())
                .status(admission.getStatus())
                .admittedAt(admission.getAdmittedAt())
                .dischargedAt(admission.getDischargedAt())
                .closedAt(admission.getClosedAt())
                .followUpAppointmentId(admission.getFollowUpAppointmentId())
                .dischargeType(summary != null ? summary.getDischargeType() : null)
                .summaryText(summary != null ? summary.getSummaryText() : null)
                .followUpPlan(summary != null ? summary.getFollowUpPlan() : null)
                .diagnosisText(summary != null ? summary.getDiagnosisText() : null)
                .medicationsText(summary != null ? summary.getMedicationsText() : null)
                .adviceText(summary != null ? summary.getAdviceText() : null)
                .build();
    }

    private int resolveWindowDays(UUID hospitalId, UUID tenantId) {
        Map<String, Object> cfg = catalogService.resolveCountryConfig(hospitalId, tenantId);
        Object value = cfg.get("readmissionWindowDays");
        if (value instanceof Number n) {
            return Math.max(1, n.intValue());
        }
        if (value instanceof String s) {
            try {
                return Math.max(1, Integer.parseInt(s.trim()));
            } catch (NumberFormatException ignored) {
                // fall through
            }
        }
        return 30;
    }

    private IpdAdmissionEntity requireAdmission(UUID tenantId, UUID admissionId) {
        return admissionRepository.findByIdAndTenantIdAndDeletedAtIsNull(admissionId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Admission not found"));
    }
}
