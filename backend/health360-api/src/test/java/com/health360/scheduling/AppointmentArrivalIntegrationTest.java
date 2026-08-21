package com.health360.scheduling;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.hospital.presentation.dto.request.InviteStaffRequest;
import com.health360.opd.presentation.dto.request.CheckInAppointmentRequest;
import com.health360.scheduling.presentation.dto.request.ArriveAppointmentRequest;
import com.health360.support.IntegrationTestAuth;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class AppointmentArrivalIntegrationTest {

    private static final UUID TENANT_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID PATIENT_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private static final UUID DOCTOR_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000060");
    private static final String HOSPITAL_ADMIN_EMAIL = "hospital.admin@health360.test";

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("health360_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.autoconfigure.exclude",
                () -> "org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void arriveSetsAppointmentArrivedAndCreatesEncounterQueue() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);
        UUID appointmentId = insertConfirmedAppointment();

        ArriveAppointmentRequest arriveRequest = new ArriveAppointmentRequest();

        MvcResult arriveResult = mockMvc.perform(post("/api/v1/scheduling/appointments/" + appointmentId + "/arrive")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(arriveRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.appointmentStatus").value("ARRIVED"))
                .andExpect(jsonPath("$.data.encounter.status").value("WAITING"))
                .andExpect(jsonPath("$.data.queueEntry.status").value("WAITING"))
                .andExpect(jsonPath("$.data.queueEntry.tokenDisplay").exists())
                .andReturn();

        JsonNode first = objectMapper.readTree(arriveResult.getResponse().getContentAsString()).path("data");
        String tokenDisplay = first.path("queueEntry").path("tokenDisplay").asText();
        String encounterId = first.path("encounter").path("encounterId").asText();

        String status = jdbcTemplate.queryForObject(
                "SELECT status FROM scheduling.appointments WHERE id = ?",
                String.class,
                appointmentId);
        org.junit.jupiter.api.Assertions.assertEquals("ARRIVED", status);

        // Idempotent re-arrive
        mockMvc.perform(post("/api/v1/scheduling/appointments/" + appointmentId + "/arrive")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.appointmentStatus").value("ARRIVED"))
                .andExpect(jsonPath("$.data.encounter.encounterId").value(encounterId))
                .andExpect(jsonPath("$.data.queueEntry.tokenDisplay").value(tokenDisplay));

        // Legacy check-in path also sets ARRIVED
        UUID appointmentId2 = insertConfirmedAppointment();
        CheckInAppointmentRequest checkIn = new CheckInAppointmentRequest();
        checkIn.setAppointmentId(appointmentId2);

        mockMvc.perform(post("/api/v1/opd/registrations/check-in")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkIn)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.appointmentStatus").value("ARRIVED"));

        // Receptionist can arrive
        String receptionistEmail = "receptionist.p2f1." + System.currentTimeMillis() + "@health360.test";
        InviteStaffRequest inviteRequest = new InviteStaffRequest();
        inviteRequest.setEmail(receptionistEmail);
        inviteRequest.setFirstName("Front");
        inviteRequest.setLastName("Desk");
        inviteRequest.setTemporaryPassword("SecureP@ss1!");
        inviteRequest.setHospitalId(HOSPITAL_ID);
        inviteRequest.setBranchId(BRANCH_ID);
        inviteRequest.setRoleName("RECEPTIONIST");
        inviteRequest.setJobTitle("Front desk");

        mockMvc.perform(post("/api/v1/hospital/staff/invite")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isCreated());

        String receptionistToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, receptionistEmail, "SecureP@ss1!");

        UUID appointmentId3 = insertConfirmedAppointment();
        mockMvc.perform(post("/api/v1/scheduling/appointments/" + appointmentId3 + "/arrive")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.appointmentStatus").value("ARRIVED"));
    }

    private UUID insertConfirmedAppointment() {
        UUID slotId = jdbcTemplate.queryForObject(
                """
                SELECT id FROM scheduling.time_slots
                WHERE doctor_id = ? AND hospital_id = ? AND branch_id = ? AND status = 'AVAILABLE'
                ORDER BY start_time
                LIMIT 1
                """,
                UUID.class,
                DOCTOR_PROFILE_ID, HOSPITAL_ID, BRANCH_ID);

        if (slotId == null) {
            throw new IllegalStateException("No available slot for arrival test");
        }

        UUID appointmentId = UUID.randomUUID();
        jdbcTemplate.update(
                """
                INSERT INTO scheduling.appointments (
                    id, tenant_id, patient_id, doctor_id, hospital_id, branch_id, slot_id,
                    consultation_type, consultation_fee, currency, status, scheduled_at,
                    created_at, updated_at, version
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?,
                    'IN_PERSON', 500.00, 'INR', 'CONFIRMED', NOW(),
                    NOW(), NOW(), 0
                )
                """,
                appointmentId, TENANT_ID, PATIENT_PROFILE_ID, DOCTOR_PROFILE_ID,
                HOSPITAL_ID, BRANCH_ID, slotId);

        jdbcTemplate.update(
                "UPDATE scheduling.time_slots SET status = 'BOOKED' WHERE id = ?",
                slotId);

        return appointmentId;
    }
}
