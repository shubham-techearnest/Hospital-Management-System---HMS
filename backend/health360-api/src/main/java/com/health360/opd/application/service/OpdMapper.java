package com.health360.opd.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.presentation.dto.response.EncounterResponse;
import com.health360.opd.infrastructure.persistence.entity.OpdDeskEntity;
import com.health360.opd.infrastructure.persistence.entity.OpdQueueEntryEntity;
import com.health360.opd.presentation.dto.response.OpdDeskResponse;
import com.health360.opd.presentation.dto.response.OpdQueueEntryResponse;
import org.springframework.stereotype.Component;

@Component
public class OpdMapper {

    OpdDeskResponse toDeskResponse(OpdDeskEntity entity) {
        return OpdDeskResponse.builder()
                .deskId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .departmentId(entity.getDepartmentId())
                .name(entity.getName())
                .code(entity.getCode())
                .active(entity.isActive())
                .build();
    }

    OpdQueueEntryResponse toQueueEntryResponse(
            OpdQueueEntryEntity entry, EncounterEntity encounter, EncounterResponse encounterResponse) {
        return OpdQueueEntryResponse.builder()
                .queueEntryId(entry.getId())
                .encounterId(entry.getEncounterId())
                .hospitalId(entry.getHospitalId())
                .branchId(entry.getBranchId())
                .deskId(entry.getDeskId())
                .appointmentId(entry.getAppointmentId())
                .patientId(encounter.getPatientId())
                .primaryDoctorId(encounter.getPrimaryDoctorId())
                .registrationType(entry.getRegistrationType())
                .tokenDisplay(entry.getTokenDisplay())
                .tokenNumber(entry.getTokenNumber())
                .queueDate(entry.getQueueDate())
                .status(entry.getStatus())
                .priority(entry.getPriority())
                .checkedInAt(entry.getCheckedInAt())
                .calledAt(entry.getCalledAt())
                .serviceStartedAt(entry.getServiceStartedAt())
                .completedAt(entry.getCompletedAt())
                .encounterNumber(encounter.getEncounterNumber())
                .encounterStatus(encounter.getStatus())
                .encounter(encounterResponse)
                .build();
    }

    EncounterResponse toEncounterResponse(EncounterEntity entity) {
        return EncounterResponse.builder()
                .encounterId(entity.getId())
                .encounterNumber(entity.getEncounterNumber())
                .patientId(entity.getPatientId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .departmentId(entity.getDepartmentId())
                .primaryDoctorId(entity.getPrimaryDoctorId())
                .appointmentId(entity.getAppointmentId())
                .encounterType(entity.getEncounterType())
                .status(entity.getStatus())
                .visitReason(entity.getVisitReason())
                .startedAt(entity.getStartedAt())
                .endedAt(entity.getEndedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
