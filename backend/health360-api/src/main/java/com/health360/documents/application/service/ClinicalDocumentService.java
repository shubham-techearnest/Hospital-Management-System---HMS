package com.health360.documents.application.service;

import com.health360.clinical.application.service.EncounterAccessService;
import com.health360.clinical.infrastructure.persistence.entity.ClinicalNoteEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionEntity;
import com.health360.clinical.infrastructure.persistence.entity.PrescriptionItemEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalNoteRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionItemRepository;
import com.health360.clinical.infrastructure.persistence.repository.PrescriptionRepository;
import com.health360.config.security.UserPrincipal;
import com.health360.documents.presentation.dto.response.ClinicalDocumentResponse;
import com.health360.documents.presentation.dto.response.LetterheadSnapshot;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.hospital.infrastructure.persistence.entity.BranchEntity;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.laboratory.infrastructure.persistence.entity.LabOrderEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabReportEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabResultEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabSampleEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabTestParameterEntity;
import com.health360.laboratory.infrastructure.persistence.repository.LabOrderRepository;
import com.health360.laboratory.infrastructure.persistence.repository.LabReportRepository;
import com.health360.laboratory.infrastructure.persistence.repository.LabResultRepository;
import com.health360.laboratory.infrastructure.persistence.repository.LabSampleRepository;
import com.health360.laboratory.infrastructure.persistence.repository.LabTestParameterRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestEntity;
import com.health360.pharmacy.infrastructure.persistence.entity.PharmacyRequestItemEntity;
import com.health360.pharmacy.infrastructure.persistence.repository.PharmacyRequestItemRepository;
import com.health360.pharmacy.infrastructure.persistence.repository.PharmacyRequestRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicalDocumentService {

    private static final DateTimeFormatter DT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm").withLocale(Locale.ENGLISH);
    private static final DateTimeFormatter D =
            DateTimeFormatter.ofPattern("dd MMM yyyy").withLocale(Locale.ENGLISH);

    private final EncounterRepository encounterRepository;
    private final EncounterAccessService encounterAccessService;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final ClinicalNoteRepository clinicalNoteRepository;
    private final LabOrderRepository labOrderRepository;
    private final LabReportRepository labReportRepository;
    private final LabResultRepository labResultRepository;
    private final LabSampleRepository labSampleRepository;
    private final LabTestParameterRepository labTestParameterRepository;
    private final PharmacyRequestRepository pharmacyRequestRepository;
    private final PharmacyRequestItemRepository pharmacyRequestItemRepository;
    private final HospitalRepository hospitalRepository;
    private final BranchRepository branchRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    @Transactional(readOnly = true)
    public ClinicalDocumentResponse prescriptionDocument(
            UserPrincipal principal, UUID encounterId, UUID prescriptionId) {
        EncounterEntity encounter = requireEncounter(principal, encounterId);
        encounterAccessService.assertCanReadEncounter(principal, encounter);
        PrescriptionEntity rx = prescriptionRepository.findByIdAndTenantIdAndDeletedAtIsNull(
                        prescriptionId, principal.getTenantId())
                .orElseThrow(() -> notFound("Prescription not found"));
        if (!rx.getEncounterId().equals(encounterId)) {
            throw notFound("Prescription not found");
        }
        List<PrescriptionItemEntity> items = prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(prescriptionId);
        List<ClinicalDocumentResponse.MedicationLine> meds = new ArrayList<>();
        int i = 1;
        for (PrescriptionItemEntity item : items) {
            meds.add(ClinicalDocumentResponse.MedicationLine.builder()
                    .sequence(i++)
                    .medicineName(item.getMedicineName())
                    .doseText(item.getDoseText())
                    .route(item.getRoute())
                    .frequency(item.getFrequency())
                    .durationText(item.getDurationDays() != null ? item.getDurationDays() + " days" : null)
                    .quantity(item.getQuantity() != null ? String.valueOf(item.getQuantity()) : null)
                    .instructions(item.getInstructions())
                    .howToTake(plainHowToTake(item))
                    .build());
        }
        return ClinicalDocumentResponse.builder()
                .documentType("PRESCRIPTION")
                .documentTitle("MEDICAL PRESCRIPTION")
                .documentNumber(rx.getPrescriptionNumber())
                .issuedAt(formatDt(rx.getSignedAt() != null ? rx.getSignedAt() : rx.getCreatedAt()))
                .letterhead(letterhead(principal.getTenantId(), encounter.getHospitalId(), encounter.getBranchId()))
                .patient(patientBlock(principal.getTenantId(), encounter))
                .clinician(clinicianFromUser(principal.getTenantId(),
                        rx.getSignedBy() != null ? rx.getSignedBy() : rx.getPrescribedBy(),
                        "Consulting Doctor",
                        rx.getSignedAt()))
                .medications(meds)
                .notes(rx.getNotes())
                .build();
    }

    @Transactional(readOnly = true)
    public ClinicalDocumentResponse consultationDocument(
            UserPrincipal principal, UUID encounterId, UUID noteId) {
        EncounterEntity encounter = requireEncounter(principal, encounterId);
        encounterAccessService.assertCanReadEncounter(principal, encounter);
        ClinicalNoteEntity note = clinicalNoteRepository.findById(noteId)
                .filter(n -> n.getDeletedAt() == null && n.getTenantId().equals(principal.getTenantId()))
                .orElseThrow(() -> notFound("Consultation note not found"));
        if (!note.getEncounterId().equals(encounterId)) {
            throw notFound("Consultation note not found");
        }
        return ClinicalDocumentResponse.builder()
                .documentType("CONSULTATION")
                .documentTitle("CONSULTATION SUMMARY")
                .documentNumber(encounter.getEncounterNumber() != null
                        ? encounter.getEncounterNumber() + "-CN"
                        : note.getId().toString().substring(0, 8).toUpperCase())
                .issuedAt(formatDt(note.getFinalizedAt() != null ? note.getFinalizedAt() : note.getRecordedAt()))
                .letterhead(letterhead(principal.getTenantId(), encounter.getHospitalId(), encounter.getBranchId()))
                .patient(patientBlock(principal.getTenantId(), encounter))
                .clinician(clinicianFromUser(principal.getTenantId(),
                        note.getFinalizedBy() != null ? note.getFinalizedBy() : note.getCreatedBy(),
                        "Consulting Doctor",
                        note.getFinalizedAt()))
                .consultation(ClinicalDocumentResponse.ConsultationSections.builder()
                        .chiefComplaint(note.getChiefComplaint())
                        .hpi(note.getHpi())
                        .examination(note.getExamination())
                        .assessment(note.getAssessment())
                        .plan(note.getPlan())
                        .content(note.getContent())
                        .build())
                .build();
    }

    @Transactional(readOnly = true)
    public ClinicalDocumentResponse labReportDocument(UserPrincipal principal, UUID labOrderId) {
        LabOrderEntity order = labOrderRepository.findByIdAndTenantIdAndDeletedAtIsNull(
                        labOrderId, principal.getTenantId())
                .orElseThrow(() -> notFound("Lab order not found"));
        EncounterEntity encounter = requireEncounter(principal, order.getEncounterId());
        encounterAccessService.assertCanReadEncounter(principal, encounter);

        LabReportEntity report = labReportRepository.findByLabOrderIdAndDeletedAtIsNull(labOrderId)
                .orElseThrow(() -> notFound("Lab report not released yet"));
        LabSampleEntity sample = labSampleRepository.findByLabOrderIdAndDeletedAtIsNull(labOrderId).orElse(null);
        List<LabResultEntity> results = labResultRepository
                .findByTenantIdAndLabOrderIdAndDeletedAtIsNullOrderByRecordedAtAsc(
                        principal.getTenantId(), labOrderId);
        Map<UUID, LabTestParameterEntity> params = labTestParameterRepository
                .findAllById(results.stream().map(LabResultEntity::getParameterId).toList())
                .stream()
                .collect(Collectors.toMap(LabTestParameterEntity::getId, Function.identity(), (a, b) -> a));

        List<ClinicalDocumentResponse.LabResultLine> lines = results.stream()
                .map(r -> {
                    LabTestParameterEntity p = params.get(r.getParameterId());
                    return ClinicalDocumentResponse.LabResultLine.builder()
                            .testName(p != null ? p.getName() : "Parameter")
                            .valueText(r.getValueText())
                            .unit(r.getUnit() != null ? r.getUnit() : (p != null ? p.getUnit() : null))
                            .referenceRange(p != null ? p.getReferenceRange() : null)
                            .flag(r.getStatus())
                            .build();
                })
                .toList();

        return ClinicalDocumentResponse.builder()
                .documentType("LAB_REPORT")
                .documentTitle("LABORATORY REPORT")
                .documentNumber(labOrderId.toString().substring(0, 8).toUpperCase())
                .issuedAt(formatDt(report.getReleasedAt()))
                .letterhead(letterhead(principal.getTenantId(), encounter.getHospitalId(), encounter.getBranchId()))
                .patient(patientBlock(principal.getTenantId(), encounter))
                .clinician(clinicianFromUser(principal.getTenantId(), report.getReleasedBy(),
                        "Lab / Pathologist", report.getReleasedAt()))
                .lab(ClinicalDocumentResponse.LabSections.builder()
                        .orderNumber(labOrderId.toString().substring(0, 8).toUpperCase())
                        .orderedAt(formatDt(order.getCreatedAt()))
                        .sampleCollectedAt(sample != null ? formatDt(sample.getCollectedAt()) : null)
                        .reportedAt(formatDt(report.getReleasedAt()))
                        .summaryText(report.getSummaryText())
                        .critical(report.isCritical())
                        .results(lines)
                        .build())
                .build();
    }

    @Transactional(readOnly = true)
    public ClinicalDocumentResponse pharmacyDispenseSlip(UserPrincipal principal, UUID requestId) {
        PharmacyRequestEntity req = pharmacyRequestRepository.findById(requestId)
                .filter(r -> r.getDeletedAt() == null && r.getTenantId().equals(principal.getTenantId()))
                .orElseThrow(() -> notFound("Pharmacy request not found"));
        EncounterEntity encounter = requireEncounter(principal, req.getEncounterId());
        encounterAccessService.assertCanReadEncounter(principal, encounter);

        List<PharmacyRequestItemEntity> items = pharmacyRequestItemRepository
                .findByPharmacyRequestIdAndDeletedAtIsNullOrderByCreatedAtAsc(requestId);
        Map<UUID, PrescriptionItemEntity> rxItems = prescriptionItemRepository
                .findByPrescriptionIdAndDeletedAtIsNullOrderBySortOrderAsc(req.getPrescriptionId())
                .stream()
                .collect(Collectors.toMap(PrescriptionItemEntity::getId, Function.identity(), (a, b) -> a));

        List<ClinicalDocumentResponse.PharmacyLine> lines = items.stream()
                .map(item -> {
                    PrescriptionItemEntity rxItem = rxItems.get(item.getPrescriptionItemId());
                    return ClinicalDocumentResponse.PharmacyLine.builder()
                            .medicineName(item.getMedicineName())
                            .quantity(String.valueOf(
                                    item.getQuantityDispensed() != null && item.getQuantityDispensed() > 0
                                            ? item.getQuantityDispensed()
                                            : (item.getQuantityRequested() != null
                                                    ? item.getQuantityRequested() : 0)))
                            .howToTake(rxItem != null ? plainHowToTake(rxItem) : item.getNotes())
                            .amountText(null)
                            .build();
                })
                .toList();

        return ClinicalDocumentResponse.builder()
                .documentType("PHARMACY_DISPENSE")
                .documentTitle("MEDICINE DISPENSE SLIP")
                .documentNumber(req.getRequestNumber())
                .issuedAt(formatDt(req.getDispensedAt() != null ? req.getDispensedAt() : req.getRequestedAt()))
                .letterhead(letterhead(principal.getTenantId(), req.getHospitalId(), req.getBranchId()))
                .patient(patientBlock(principal.getTenantId(), encounter))
                .clinician(clinicianFromUser(principal.getTenantId(),
                        req.getDispensedBy() != null ? req.getDispensedBy() : req.getRequestedBy(),
                        "Pharmacist",
                        req.getDispensedAt()))
                .pharmacy(ClinicalDocumentResponse.PharmacyBillSections.builder()
                        .requestNumber(req.getRequestNumber())
                        .dispensedAt(formatDt(req.getDispensedAt()))
                        .lines(lines)
                        .totalAmountText(null)
                        .build())
                .notes(req.getPharmacistNotes())
                .build();
    }

    private LetterheadSnapshot letterhead(UUID tenantId, UUID hospitalId, UUID branchId) {
        HospitalEntity hospital = hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId)
                .orElseThrow(() -> notFound("Hospital not found"));
        BranchEntity branch = branchRepository.findByIdAndHospitalIdAndDeletedAtIsNull(branchId, hospitalId)
                .orElse(null);
        return LetterheadSnapshot.builder()
                .hospitalId(hospital.getId())
                .hospitalName(hospital.getName())
                .registrationNumber(hospital.getRegistrationNumber())
                .accreditation(hospital.getAccreditation())
                .tagline(hospital.getLetterheadTagline())
                .footerText(hospital.getLetterheadFooterText())
                .hasLogo(hospital.getLetterheadLogoStorageKey() != null
                        && !hospital.getLetterheadLogoStorageKey().isBlank())
                .logoUrl(hospital.getLetterheadLogoStorageKey() != null
                        ? "/api/v1/hospitals/" + hospital.getId() + "/letterhead/logo"
                        : null)
                .branchName(branch != null ? branch.getName() : null)
                .addressLine1(branch != null ? branch.getAddressLine1() : null)
                .addressLine2(branch != null ? branch.getAddressLine2() : null)
                .city(branch != null ? branch.getCity() : null)
                .state(branch != null ? branch.getState() : null)
                .pincode(branch != null ? branch.getPincode() : null)
                .phone(branch != null ? branch.getPhone() : hospital.getEmergencyPhone())
                .email(branch != null ? branch.getEmail() : null)
                .build();
    }

    private ClinicalDocumentResponse.PatientBlock patientBlock(UUID tenantId, EncounterEntity encounter) {
        PatientProfileEntity patient = patientProfileRepository.findById(encounter.getPatientId())
                .filter(p -> p.getDeletedAt() == null && p.getTenantId().equals(tenantId))
                .orElse(null);
        String name = "Patient";
        if (patient != null) {
            UserEntity user = userRepository.findById(patient.getUserId()).orElse(null);
            if (user != null) {
                name = ((user.getFirstName() != null ? user.getFirstName() : "")
                        + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();
                if (name.isEmpty()) {
                    name = "Patient";
                }
            }
        }
        String ageSex = null;
        if (patient != null && patient.getDateOfBirth() != null) {
            long years = ChronoUnit.YEARS.between(patient.getDateOfBirth(), java.time.LocalDate.now());
            ageSex = years + "Y"
                    + (patient.getGender() != null ? " / " + patient.getGender() : "");
        }
        return ClinicalDocumentResponse.PatientBlock.builder()
                .patientId(encounter.getPatientId())
                .patientName(name)
                .uhid(patient != null ? patient.getUhid() : null)
                .ageSex(ageSex)
                .encounterNumber(encounter.getEncounterNumber())
                .visitDate(formatD(encounter.getStartedAt() != null ? encounter.getStartedAt() : encounter.getCreatedAt()))
                .build();
    }

    private ClinicalDocumentResponse.ClinicianBlock clinicianFromUser(
            UUID tenantId, UUID userId, String roleLabel, Instant signedAt) {
        if (userId == null) {
            return ClinicalDocumentResponse.ClinicianBlock.builder().roleLabel(roleLabel).build();
        }
        UserEntity user = userRepository.findById(userId).orElse(null);
        String name = user != null
                ? ((user.getFirstName() != null ? user.getFirstName() : "")
                + " " + (user.getLastName() != null ? user.getLastName() : "")).trim()
                : null;
        DoctorProfileEntity doctor = doctorProfileRepository
                .findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId)
                .orElse(null);
        return ClinicalDocumentResponse.ClinicianBlock.builder()
                .name(name != null && !name.isEmpty() ? name : null)
                .roleLabel(roleLabel)
                .registrationNumber(doctor != null ? doctor.getMedicalRegistrationNumber() : null)
                .signedAt(formatDt(signedAt))
                .build();
    }

    private String plainHowToTake(PrescriptionItemEntity item) {
        List<String> parts = new ArrayList<>();
        if (item.getDoseText() != null && !item.getDoseText().isBlank()) {
            parts.add("Take " + item.getDoseText());
        }
        if (item.getFrequency() != null && !item.getFrequency().isBlank()) {
            parts.add(frequencyPlain(item.getFrequency()));
        }
        if (item.getRoute() != null && !item.getRoute().isBlank()) {
            parts.add("(" + item.getRoute().toLowerCase(Locale.ENGLISH) + ")");
        }
        if (item.getDurationDays() != null) {
            parts.add("for " + item.getDurationDays() + " day(s)");
        }
        if (item.getInstructions() != null && !item.getInstructions().isBlank()) {
            parts.add(item.getInstructions().trim());
        }
        return parts.isEmpty() ? null : String.join(" — ", parts);
    }

    private String frequencyPlain(String frequency) {
        String f = frequency.trim().toUpperCase(Locale.ENGLISH);
        return switch (f) {
            case "OD", "1-0-0" -> "once daily (morning)";
            case "BD", "1-0-1" -> "twice daily (morning and night)";
            case "TDS", "1-1-1" -> "three times daily";
            case "QID", "1-1-1-1" -> "four times daily";
            case "HS", "0-0-1" -> "at bedtime";
            case "SOS" -> "only when needed";
            default -> frequency;
        };
    }

    private EncounterEntity requireEncounter(UserPrincipal principal, UUID encounterId) {
        return encounterRepository.findByIdAndTenantIdAndDeletedAtIsNull(encounterId, principal.getTenantId())
                .orElseThrow(() -> notFound("Encounter not found"));
    }

    private String formatDt(Instant instant) {
        if (instant == null) {
            return null;
        }
        return DT.format(instant.atZone(ZoneId.systemDefault()));
    }

    private String formatD(Instant instant) {
        if (instant == null) {
            return null;
        }
        return D.format(instant.atZone(ZoneId.systemDefault()));
    }

    private BusinessException notFound(String message) {
        return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }
}
