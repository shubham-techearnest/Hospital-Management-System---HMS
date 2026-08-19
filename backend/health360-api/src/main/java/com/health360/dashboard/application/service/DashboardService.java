package com.health360.dashboard.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.dashboard.presentation.dto.response.*;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.repository.*;
import com.health360.icu.infrastructure.persistence.repository.IcuBedRepository;
import com.health360.icu.infrastructure.persistence.repository.IcuStayRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdAdmissionRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdBedRepository;
import com.health360.laboratory.infrastructure.persistence.repository.LabOrderRepository;
import com.health360.opd.infrastructure.persistence.repository.OpdDeskRepository;
import com.health360.opd.infrastructure.persistence.repository.OpdQueueEntryRepository;
import com.health360.ot.infrastructure.persistence.repository.OtProcedureRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.pharmacy.infrastructure.persistence.repository.MedicationOrderRepository;
import com.health360.radiology.infrastructure.persistence.repository.ImagingOrderRepository;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardScopeService dashboardScopeService;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final HospitalAssociationRepository associationRepository;
    private final StaffRepository staffRepository;
    private final EncounterRepository encounterRepository;
    private final OpdQueueEntryRepository opdQueueEntryRepository;
    private final OpdDeskRepository opdDeskRepository;
    private final IpdAdmissionRepository ipdAdmissionRepository;
    private final IpdBedRepository ipdBedRepository;
    private final IcuStayRepository icuStayRepository;
    private final IcuBedRepository icuBedRepository;
    private final LabOrderRepository labOrderRepository;
    private final ImagingOrderRepository imagingOrderRepository;
    private final MedicationOrderRepository medicationOrderRepository;
    private final OtProcedureRepository otProcedureRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional(readOnly = true)
    public HospitalDashboardResponse getHospitalDashboard(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        DashboardScope scope = principal.getRoles().contains("HOSPITAL_ADMIN")
                ? dashboardScopeService.resolveHospitalAdmin(principal)
                : dashboardScopeService.resolve(principal, hospitalId, branchId);

        UUID tenantId = principal.getTenantId();
        LocalDate today = LocalDate.now();

        long branches = branchRepository.countByHospitalIdAndDeletedAtIsNull(scope.hospitalId());
        long departments = departmentRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(scope.hospitalId()).size();
        long doctors = associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(scope.hospitalId())
                .stream().filter(a -> "ACTIVE".equals(a.getStatus())).count();
        long staff = staffRepository.countByTenantIdAndHospitalIdAndEmploymentStatusAndDeletedAtIsNull(
                tenantId, scope.hospitalId(), "ACTIVE");

        return HospitalDashboardResponse.builder()
                .hospitalId(scope.hospitalId())
                .branchId(scope.branchId())
                .hospitalName(scope.hospitalName())
                .branchName(scope.branchName())
                .branchCount((int) branches)
                .departmentCount((int) departments)
                .doctorCount((int) doctors)
                .activeStaffCount((int) staff)
                .totalEncounters(encounterRepository.countByTenantIdAndHospitalIdAndDeletedAtIsNull(
                        tenantId, scope.hospitalId()))
                .opdWaitingToday(countOpdQueue(tenantId, scope, today, "WAITING"))
                .opdInProgressToday(countOpdQueue(tenantId, scope, today, "IN_SERVICE")
                        + countOpdQueue(tenantId, scope, today, "CALLED"))
                .activeIpdAdmissions(countIpd(tenantId, scope, "ADMITTED"))
                .activeIcuStays(countIcu(tenantId, scope, "ACTIVE"))
                .pendingLabOrders(labOrderRepository.findPendingLabItems(tenantId, scope.hospitalId(), scope.branchId()).size())
                .pendingRadiologyOrders(imagingOrderRepository.findPendingImagingItems(tenantId, scope.hospitalId(), scope.branchId()).size())
                .pendingPharmacyOrders(medicationOrderRepository.findPendingMedicationOrders(tenantId, scope.hospitalId(), scope.branchId()).size())
                .pendingOtProcedures(otProcedureRepository.findPendingProcedureItems(tenantId, scope.hospitalId(), scope.branchId()).size())
                .build();
    }

    @Transactional(readOnly = true)
    public OpdDashboardResponse getOpdDashboard(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        DashboardScope scope = dashboardScopeService.resolve(principal, hospitalId, branchId);
        UUID tenantId = principal.getTenantId();
        LocalDate today = LocalDate.now();

        return OpdDashboardResponse.builder()
                .hospitalId(scope.hospitalId())
                .branchId(scope.branchId())
                .hospitalName(scope.hospitalName())
                .branchName(scope.branchName())
                .queueDate(today)
                .deskCount(opdDeskRepository.countByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId()))
                .waitingCount(countOpdQueue(tenantId, scope, today, "WAITING"))
                .calledCount(countOpdQueue(tenantId, scope, today, "CALLED"))
                .inServiceCount(countOpdQueue(tenantId, scope, today, "IN_SERVICE"))
                .completedTodayCount(countOpdQueue(tenantId, scope, today, "COMPLETED"))
                .totalTodayCount(countOpdQueue(tenantId, scope, today, null))
                .build();
    }

    @Transactional(readOnly = true)
    public IpdDashboardResponse getIpdDashboard(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        DashboardScope scope = dashboardScopeService.resolve(principal, hospitalId, branchId);
        UUID tenantId = principal.getTenantId();

        long total = ipdBedRepository.countByHospitalBranch(tenantId, scope.hospitalId(), scope.branchId(), null);
        long available = ipdBedRepository.countByHospitalBranch(tenantId, scope.hospitalId(), scope.branchId(), "AVAILABLE");
        long occupied = ipdBedRepository.countByHospitalBranch(tenantId, scope.hospitalId(), scope.branchId(), "OCCUPIED");

        return IpdDashboardResponse.builder()
                .hospitalId(scope.hospitalId())
                .branchId(scope.branchId())
                .hospitalName(scope.hospitalName())
                .branchName(scope.branchName())
                .activeAdmissions(countIpd(tenantId, scope, "ADMITTED"))
                .availableBeds(available)
                .occupiedBeds(occupied)
                .totalBeds(total)
                .build();
    }

    @Transactional(readOnly = true)
    public IcuDashboardResponse getIcuDashboard(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        DashboardScope scope = dashboardScopeService.resolve(principal, hospitalId, branchId);
        UUID tenantId = principal.getTenantId();

        long total = icuBedRepository.countByHospitalBranch(tenantId, scope.hospitalId(), scope.branchId(), null);
        long available = icuBedRepository.countByHospitalBranch(tenantId, scope.hospitalId(), scope.branchId(), "AVAILABLE");
        long occupied = icuBedRepository.countByHospitalBranch(tenantId, scope.hospitalId(), scope.branchId(), "OCCUPIED");

        return IcuDashboardResponse.builder()
                .hospitalId(scope.hospitalId())
                .branchId(scope.branchId())
                .hospitalName(scope.hospitalName())
                .branchName(scope.branchName())
                .activeStays(countIcu(tenantId, scope, "ACTIVE"))
                .availableBeds(available)
                .occupiedBeds(occupied)
                .totalBeds(total)
                .build();
    }

    @Transactional(readOnly = true)
    public ModuleWorklistDashboardResponse getLabDashboard(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        DashboardScope scope = dashboardScopeService.resolve(principal, hospitalId, branchId);
        UUID tenantId = principal.getTenantId();
        return ModuleWorklistDashboardResponse.builder()
                .hospitalId(scope.hospitalId())
                .branchId(scope.branchId())
                .hospitalName(scope.hospitalName())
                .branchName(scope.branchName())
                .pendingWorklistCount(labOrderRepository.findPendingLabItems(
                        tenantId, scope.hospitalId(), scope.branchId()).size())
                .receivedCount(labOrderRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "RECEIVED"))
                .inProgressCount(labOrderRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "SAMPLE_COLLECTED"))
                .completedCount(labOrderRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "RELEASED"))
                .build();
    }

    @Transactional(readOnly = true)
    public ModuleWorklistDashboardResponse getRadiologyDashboard(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        DashboardScope scope = dashboardScopeService.resolve(principal, hospitalId, branchId);
        UUID tenantId = principal.getTenantId();
        return ModuleWorklistDashboardResponse.builder()
                .hospitalId(scope.hospitalId())
                .branchId(scope.branchId())
                .hospitalName(scope.hospitalName())
                .branchName(scope.branchName())
                .pendingWorklistCount(imagingOrderRepository.findPendingImagingItems(
                        tenantId, scope.hospitalId(), scope.branchId()).size())
                .receivedCount(imagingOrderRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "RECEIVED"))
                .inProgressCount(imagingOrderRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "STUDY_IN_PROGRESS"))
                .completedCount(imagingOrderRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "RELEASED"))
                .build();
    }

    @Transactional(readOnly = true)
    public ModuleWorklistDashboardResponse getPharmacyDashboard(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        DashboardScope scope = dashboardScopeService.resolve(principal, hospitalId, branchId);
        UUID tenantId = principal.getTenantId();
        return ModuleWorklistDashboardResponse.builder()
                .hospitalId(scope.hospitalId())
                .branchId(scope.branchId())
                .hospitalName(scope.hospitalName())
                .branchName(scope.branchName())
                .pendingWorklistCount(medicationOrderRepository.findPendingMedicationOrders(
                        tenantId, scope.hospitalId(), scope.branchId()).size())
                .receivedCount(medicationOrderRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "RECEIVED"))
                .inProgressCount(medicationOrderRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "ACTIVE"))
                .completedCount(medicationOrderRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "COMPLETED"))
                .build();
    }

    @Transactional(readOnly = true)
    public ModuleWorklistDashboardResponse getOtDashboard(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        DashboardScope scope = dashboardScopeService.resolve(principal, hospitalId, branchId);
        UUID tenantId = principal.getTenantId();
        return ModuleWorklistDashboardResponse.builder()
                .hospitalId(scope.hospitalId())
                .branchId(scope.branchId())
                .hospitalName(scope.hospitalName())
                .branchName(scope.branchName())
                .pendingWorklistCount(otProcedureRepository.findPendingProcedureItems(
                        tenantId, scope.hospitalId(), scope.branchId()).size())
                .receivedCount(otProcedureRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "RECEIVED"))
                .inProgressCount(otProcedureRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "IN_PROGRESS"))
                .completedCount(otProcedureRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                        tenantId, scope.hospitalId(), scope.branchId(), "COMPLETED"))
                .build();
    }

    @Transactional(readOnly = true)
    public DoctorDashboardResponse getDoctorDashboard(UserPrincipal principal) {
        DoctorProfileEntity doctor = doctorProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(
                        principal.getTenantId(), principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Doctor profile not found"));

        UUID tenantId = principal.getTenantId();
        List<EncounterEntity> recent = encounterRepository
                .findByTenantIdAndPrimaryDoctorIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        tenantId, doctor.getId(), PageRequest.of(0, 5))
                .getContent();

        return DoctorDashboardResponse.builder()
                .doctorId(doctor.getId())
                .inProgressEncounters(encounterRepository.countByTenantIdAndPrimaryDoctorIdAndStatusAndDeletedAtIsNull(
                        tenantId, doctor.getId(), "IN_PROGRESS"))
                .waitingEncounters(encounterRepository.countByTenantIdAndPrimaryDoctorIdAndStatusAndDeletedAtIsNull(
                        tenantId, doctor.getId(), "WAITING"))
                .upcomingAppointments(appointmentRepository.countUpcomingByDoctor(
                        doctor.getId(), tenantId, Instant.now()))
                .recentEncounters(recent.stream().map(e -> DoctorDashboardResponse.RecentEncounterSummary.builder()
                        .encounterId(e.getId())
                        .encounterNumber(e.getEncounterNumber())
                        .patientId(e.getPatientId())
                        .status(e.getStatus())
                        .encounterType(e.getEncounterType())
                        .createdAt(e.getCreatedAt())
                        .build()).toList())
                .build();
    }

    @Transactional(readOnly = true)
    public PatientClinicalDashboardResponse getPatientClinicalDashboard(UserPrincipal principal) {
        PatientProfileEntity patient = patientProfileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(
                        principal.getTenantId(), principal.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Patient profile not found"));

        UUID tenantId = principal.getTenantId();
        List<EncounterEntity> recent = encounterRepository
                .findByTenantIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        tenantId, patient.getId(), PageRequest.of(0, 5))
                .getContent();

        long active = encounterRepository.countByTenantIdAndPatientIdAndStatusAndDeletedAtIsNull(
                        tenantId, patient.getId(), "IN_PROGRESS")
                + encounterRepository.countByTenantIdAndPatientIdAndStatusAndDeletedAtIsNull(
                        tenantId, patient.getId(), "WAITING");

        return PatientClinicalDashboardResponse.builder()
                .patientId(patient.getId())
                .totalEncounters(encounterRepository.countByTenantIdAndPatientIdAndDeletedAtIsNull(
                        tenantId, patient.getId()))
                .activeEncounters(active)
                .completedEncounters(encounterRepository.countByTenantIdAndPatientIdAndStatusAndDeletedAtIsNull(
                        tenantId, patient.getId(), "COMPLETED"))
                .recentEncounters(recent.stream().map(e -> PatientClinicalDashboardResponse.RecentEncounterSummary.builder()
                        .encounterId(e.getId())
                        .encounterNumber(e.getEncounterNumber())
                        .hospitalId(e.getHospitalId())
                        .status(e.getStatus())
                        .encounterType(e.getEncounterType())
                        .createdAt(e.getCreatedAt())
                        .build()).toList())
                .build();
    }

    private long countOpdQueue(UUID tenantId, DashboardScope scope, LocalDate date, String status) {
        return opdQueueEntryRepository.countByScopeAndDate(
                tenantId, scope.hospitalId(), scope.branchId(), date, status);
    }

    private long countIpd(UUID tenantId, DashboardScope scope, String status) {
        return ipdAdmissionRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                tenantId, scope.hospitalId(), scope.branchId(), status);
    }

    private long countIcu(UUID tenantId, DashboardScope scope, String status) {
        return icuStayRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                tenantId, scope.hospitalId(), scope.branchId(), status);
    }
}
