package com.health360.clinical.application.service;

import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.entity.StaffEntity;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.hospital.infrastructure.persistence.repository.StaffRepository;
import com.health360.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EncounterAccessServiceTest {

    @Mock
    private com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository patientProfileRepository;

    @Mock
    private com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository doctorProfileRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private StaffRepository staffRepository;

    @InjectMocks
    private EncounterAccessService accessService;

    private final UUID tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final UUID hospitalId = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private final UUID branchId = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private final UUID receptionUserId = UUID.fromString("00000000-0000-0000-0000-000000000099");

    private EncounterEntity encounter;

    @BeforeEach
    void setUp() {
        encounter = new EncounterEntity();
        encounter.setHospitalId(hospitalId);
        encounter.setBranchId(branchId);
        encounter.setPatientId(UUID.randomUUID());
    }

    @Test
    void allowsReceptionistWithHospitalAssignmentToReadEncounter() {
        UserPrincipal principal = receptionPrincipal();

        StaffEntity assignment = new StaffEntity();
        assignment.setHospitalId(hospitalId);
        assignment.setBranchId(null);
        when(staffRepository.findActiveAssignmentsForUser(tenantId, receptionUserId))
                .thenReturn(List.of(assignment));

        assertDoesNotThrow(() -> accessService.assertCanReadEncounter(principal, encounter));
    }

    @Test
    void deniesReceptionistWithoutHospitalAssignment() {
        UserPrincipal principal = receptionPrincipal();
        when(staffRepository.findActiveAssignmentsForUser(tenantId, receptionUserId))
                .thenReturn(List.of());

        assertThrows(BusinessException.class,
                () -> accessService.assertCanReadEncounter(principal, encounter));
    }

    @Test
    void allowsHospitalAdminForOwnHospital() {
        UUID adminUserId = UUID.fromString("00000000-0000-0000-0000-000000000010");
        UserPrincipal principal = new UserPrincipal(
                adminUserId,
                tenantId,
                "admin@test.com",
                "jti",
                List.of("HOSPITAL_ADMIN"),
                List.of("clinical:encounter:read"));

        HospitalEntity hospital = new HospitalEntity();
        hospital.setAdminUserId(adminUserId);
        when(hospitalRepository.findByIdAndTenantIdAndDeletedAtIsNull(hospitalId, tenantId))
                .thenReturn(Optional.of(hospital));

        assertDoesNotThrow(() -> accessService.assertCanReadEncounter(principal, encounter));
    }

    private UserPrincipal receptionPrincipal() {
        return new UserPrincipal(
                receptionUserId,
                tenantId,
                "reception@test.com",
                "jti",
                List.of("RECEPTIONIST"),
                List.of("clinical:encounter:read", "clinical:vitals:read"));
    }
}
