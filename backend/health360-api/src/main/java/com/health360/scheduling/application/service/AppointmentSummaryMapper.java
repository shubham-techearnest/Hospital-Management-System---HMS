package com.health360.scheduling.application.service;

import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.scheduling.infrastructure.persistence.entity.AppointmentEntity;
import com.health360.scheduling.presentation.dto.response.AppointmentDetailResponse;
import com.health360.scheduling.presentation.dto.response.AppointmentSummaryResponse;
import com.health360.shared.infrastructure.persistence.entity.SpecializationEntity;
import com.health360.shared.infrastructure.persistence.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AppointmentSummaryMapper {

    private static final Duration CANCELLATION_WINDOW = Duration.ofHours(2);
    private static final Set<String> CANCELLABLE = Set.of("PENDING", "CONFIRMED", "POSTPONED");
    private static final Set<String> RESCHEDULABLE = Set.of("CONFIRMED");

    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final SpecializationRepository specializationRepository;

    List<AppointmentSummaryResponse> toSummaries(
            List<AppointmentEntity> appointments,
            AppointmentLifecycleService.ViewContext context) {
        if (appointments.isEmpty()) {
            return List.of();
        }

        ContextBundle bundle = loadContext(appointments);

        return appointments.stream()
                .map(a -> toSummary(a, context, bundle))
                .toList();
    }

    AppointmentDetailResponse toDetail(
            AppointmentEntity appointment,
            AppointmentLifecycleService.ViewContext context) {
        ContextBundle bundle = loadContext(List.of(appointment));
        AppointmentSummaryResponse summary = toSummary(appointment, context, bundle);
        return AppointmentDetailResponse.builder()
                .appointmentId(summary.getAppointmentId())
                .status(summary.getStatus())
                .scheduledAt(summary.getScheduledAt())
                .consultationType(summary.getConsultationType())
                .consultationFee(summary.getConsultationFee())
                .currency(summary.getCurrency())
                .reasonForVisit(summary.getReasonForVisit())
                .cancelledAt(appointment.getCancelledAt())
                .cancellationReason(appointment.getCancellationReason())
                .completedAt(appointment.getCompletedAt())
                .rescheduledFromId(appointment.getRescheduledFromId())
                .rescheduledToId(appointment.getRescheduledToId())
                .slotId(appointment.getSlotId())
                .doctor(summary.getDoctor())
                .patient(summary.getPatient())
                .hospital(summary.getHospital())
                .canCancel(summary.isCanCancel())
                .canReschedule(summary.isCanReschedule())
                .canConfirm(summary.isCanConfirm())
                .canRequestReschedule(summary.isCanRequestReschedule())
                .canPostpone(summary.isCanPostpone())
                .canResume(summary.isCanResume())
                .canMarkCompleted(canMarkCompleted(appointment, context))
                .canMarkNoShow(canMarkNoShow(appointment, context))
                .doctorNotes(appointment.getDoctorNotes())
                .rescheduleRequestedAt(appointment.getRescheduleRequestedAt())
                .postponedAt(appointment.getPostponedAt())
                .postponeReason(appointment.getPostponeReason())
                .build();
    }

    private AppointmentSummaryResponse toSummary(
            AppointmentEntity appointment,
            AppointmentLifecycleService.ViewContext context,
            ContextBundle bundle) {
        return AppointmentSummaryResponse.builder()
                .appointmentId(appointment.getId())
                .status(appointment.getStatus())
                .scheduledAt(appointment.getScheduledAt())
                .consultationType(appointment.getConsultationType())
                .consultationFee(appointment.getConsultationFee())
                .currency(appointment.getCurrency())
                .reasonForVisit(appointment.getReasonForVisit())
                .doctor(bundle.doctorSummary(appointment.getDoctorId()))
                .patient(bundle.patientSummary(appointment.getPatientId()))
                .hospital(bundle.hospitalSummary(appointment.getHospitalId(), appointment.getBranchId()))
                .canCancel(canCancel(appointment, context))
                .canReschedule(canReschedule(appointment, context))
                .canConfirm(canConfirm(appointment, context))
                .canRequestReschedule(canRequestReschedule(appointment, context))
                .canPostpone(canPostpone(appointment, context))
                .canResume(canResume(appointment, context))
                .build();
    }

    private ContextBundle loadContext(List<AppointmentEntity> appointments) {
        Set<UUID> doctorIds = appointments.stream().map(AppointmentEntity::getDoctorId).collect(Collectors.toSet());
        Set<UUID> patientIds = appointments.stream().map(AppointmentEntity::getPatientId).collect(Collectors.toSet());
        Set<UUID> hospitalIds = appointments.stream().map(AppointmentEntity::getHospitalId).collect(Collectors.toSet());
        Set<UUID> branchIds = appointments.stream().map(AppointmentEntity::getBranchId).collect(Collectors.toSet());

        Map<UUID, DoctorProfileEntity> doctors = doctorProfileRepository.findAllById(doctorIds).stream()
                .collect(Collectors.toMap(DoctorProfileEntity::getId, Function.identity()));
        Map<UUID, PatientProfileEntity> patients = patientProfileRepository.findAllById(patientIds).stream()
                .collect(Collectors.toMap(PatientProfileEntity::getId, Function.identity()));

        Set<UUID> userIds = doctors.values().stream().map(DoctorProfileEntity::getUserId).collect(Collectors.toSet());
        userIds.addAll(patients.values().stream().map(PatientProfileEntity::getUserId).collect(Collectors.toSet()));

        Map<UUID, UserEntity> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserEntity::getId, Function.identity()));

        Map<UUID, HospitalEntity> hospitals = hospitalRepository.findAllById(hospitalIds).stream()
                .collect(Collectors.toMap(HospitalEntity::getId, Function.identity()));
        Map<UUID, BranchEntity> branches = branchRepository.findAllById(branchIds).stream()
                .collect(Collectors.toMap(BranchEntity::getId, Function.identity()));

        Set<UUID> specializationIds = doctors.values().stream()
                .map(DoctorProfileEntity::getPrimarySpecializationId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        Map<UUID, SpecializationEntity> specializations = specializationIds.isEmpty()
                ? Map.of()
                : specializationRepository.findAllById(specializationIds).stream()
                .collect(Collectors.toMap(SpecializationEntity::getId, Function.identity()));

        return new ContextBundle(doctors, patients, users, hospitals, branches, specializations);
    }

    private boolean canCancel(AppointmentEntity appointment, AppointmentLifecycleService.ViewContext context) {
        return (context == AppointmentLifecycleService.ViewContext.PATIENT
                || context == AppointmentLifecycleService.ViewContext.DOCTOR)
                && CANCELLABLE.contains(appointment.getStatus())
                && withinCancellationWindow(appointment.getScheduledAt());
    }

    private boolean canReschedule(AppointmentEntity appointment, AppointmentLifecycleService.ViewContext context) {
        return context == AppointmentLifecycleService.ViewContext.PATIENT
                && RESCHEDULABLE.contains(appointment.getStatus())
                && withinCancellationWindow(appointment.getScheduledAt());
    }

    private boolean canMarkCompleted(AppointmentEntity appointment, AppointmentLifecycleService.ViewContext context) {
        return context == AppointmentLifecycleService.ViewContext.DOCTOR
                && "CONFIRMED".equals(appointment.getStatus());
    }

    private boolean canMarkNoShow(AppointmentEntity appointment, AppointmentLifecycleService.ViewContext context) {
        return context == AppointmentLifecycleService.ViewContext.DOCTOR
                && "CONFIRMED".equals(appointment.getStatus())
                && Instant.now().isAfter(appointment.getScheduledAt().plus(Duration.ofMinutes(15)));
    }

    private boolean canConfirm(AppointmentEntity appointment, AppointmentLifecycleService.ViewContext context) {
        return context == AppointmentLifecycleService.ViewContext.DOCTOR
                && "PENDING".equals(appointment.getStatus());
    }

    private boolean canRequestReschedule(AppointmentEntity appointment, AppointmentLifecycleService.ViewContext context) {
        return context == AppointmentLifecycleService.ViewContext.DOCTOR
                && Set.of("PENDING", "CONFIRMED", "POSTPONED").contains(appointment.getStatus());
    }

    private boolean canPostpone(AppointmentEntity appointment, AppointmentLifecycleService.ViewContext context) {
        return context == AppointmentLifecycleService.ViewContext.DOCTOR
                && Set.of("PENDING", "CONFIRMED").contains(appointment.getStatus());
    }

    private boolean canResume(AppointmentEntity appointment, AppointmentLifecycleService.ViewContext context) {
        return context == AppointmentLifecycleService.ViewContext.DOCTOR
                && "POSTPONED".equals(appointment.getStatus());
    }

    private boolean withinCancellationWindow(Instant scheduledAt) {
        return Duration.between(Instant.now(), scheduledAt).compareTo(CANCELLATION_WINDOW) >= 0;
    }

    private record ContextBundle(
            Map<UUID, DoctorProfileEntity> doctors,
            Map<UUID, PatientProfileEntity> patients,
            Map<UUID, UserEntity> users,
            Map<UUID, HospitalEntity> hospitals,
            Map<UUID, BranchEntity> branches,
            Map<UUID, SpecializationEntity> specializations) {

        AppointmentSummaryResponse.DoctorSummary doctorSummary(UUID doctorId) {
            DoctorProfileEntity doctor = doctors.get(doctorId);
            if (doctor == null) {
                return AppointmentSummaryResponse.DoctorSummary.builder()
                        .id(doctorId)
                        .name("Unknown doctor")
                        .build();
            }
            UserEntity user = users.get(doctor.getUserId());
            String name = user != null
                    ? user.getFirstName() + " " + user.getLastName()
                    : "Doctor";
            String specialization = null;
            if (doctor.getPrimarySpecializationId() != null) {
                SpecializationEntity spec = specializations.get(doctor.getPrimarySpecializationId());
                if (spec != null) {
                    specialization = spec.getName();
                }
            }
            return AppointmentSummaryResponse.DoctorSummary.builder()
                    .id(doctor.getId())
                    .name(name)
                    .specialization(specialization)
                    .build();
        }

        AppointmentSummaryResponse.PatientSummary patientSummary(UUID patientId) {
            PatientProfileEntity patient = patients.get(patientId);
            if (patient == null) {
                return AppointmentSummaryResponse.PatientSummary.builder()
                        .id(patientId)
                        .name("Unknown patient")
                        .build();
            }
            UserEntity user = users.get(patient.getUserId());
            String name = user != null
                    ? user.getFirstName() + " " + user.getLastName()
                    : "Patient";
            return AppointmentSummaryResponse.PatientSummary.builder()
                    .id(patient.getId())
                    .name(name)
                    .build();
        }

        AppointmentSummaryResponse.HospitalSummary hospitalSummary(UUID hospitalId, UUID branchId) {
            HospitalEntity hospital = hospitals.get(hospitalId);
            BranchEntity branch = branches.get(branchId);
            return AppointmentSummaryResponse.HospitalSummary.builder()
                    .id(hospitalId)
                    .branchId(branchId)
                    .name(hospital != null ? hospital.getName() : "Unknown hospital")
                    .branchName(branch != null ? branch.getName() : "Unknown branch")
                    .build();
        }
    }
}
