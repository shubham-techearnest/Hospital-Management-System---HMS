package com.health360.hms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.support.IntegrationTestAuth;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HMS-11 golden paths — appointment list stability + clinical encounter create/list without 500s.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class HmsGoldenPathIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID PATIENT_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private static final UUID DOCTOR_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000063");
    private static final String DOCTOR_EMAIL = "siddharth.deshmukh@health360.test";
    private static final String PATIENT_EMAIL = "shubham@gmail.com";
    private static final String PATIENT_PASSWORD = "Kadam@123";

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

    @Test
    void patientAppointmentFiltersNeverReturn500() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, PATIENT_EMAIL, PATIENT_PASSWORD);

        for (String filter : new String[]{"upcoming", "past", "cancelled"}) {
            mockMvc.perform(get("/api/v1/scheduling/appointments/me")
                            .header("Authorization", IntegrationTestAuth.bearer(token))
                            .param("filter", filter)
                            .param("page", "0")
                            .param("size", "20"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content").isArray());
        }
    }

    @Test
    void doctorCreatesEncounterAndPatientSeesItInList() throws Exception {
        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);
        String patientToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, PATIENT_EMAIL, PATIENT_PASSWORD);

        CreateEncounterRequest request = new CreateEncounterRequest();
        request.setPatientId(PATIENT_PROFILE_ID);
        request.setHospitalId(HOSPITAL_ID);
        request.setBranchId(BRANCH_ID);
        request.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        request.setEncounterType("OPD");
        request.setVisitReason("HMS-11 golden path checkup");

        MvcResult createResult = mockMvc.perform(post("/api/v1/clinical/encounters")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.encounterId").exists())
                .andReturn();

        String encounterId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("encounterId").asText();

        mockMvc.perform(get("/api/v1/clinical/encounters/me")
                        .header("Authorization", IntegrationTestAuth.bearer(patientToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));

        mockMvc.perform(get("/api/v1/clinical/encounters/" + encounterId)
                        .header("Authorization", IntegrationTestAuth.bearer(patientToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.encounterId").value(encounterId));
    }

    @Test
    void emptyModuleListsReturn200PagedResults() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, IntegrationTestAuth.HOSPITAL_ADMIN_EMAIL);

        mockMvc.perform(get("/api/v1/opd/queue")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString())
                        .param("queueDate", "2099-01-01")
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());

        mockMvc.perform(get("/api/v1/lab/orders")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }
}
