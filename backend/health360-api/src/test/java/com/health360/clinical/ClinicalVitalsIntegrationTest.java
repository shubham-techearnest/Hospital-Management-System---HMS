package com.health360.clinical;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.clinical.presentation.dto.request.RecordClinicalVitalsRequest;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class ClinicalVitalsIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID PATIENT_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private static final UUID DOCTOR_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000063");
    private static final String DOCTOR_EMAIL = "siddharth.deshmukh@health360.test";

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
    void doctorRecordsAndListsEncounterVitals() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        CreateEncounterRequest createRequest = new CreateEncounterRequest();
        createRequest.setPatientId(PATIENT_PROFILE_ID);
        createRequest.setHospitalId(HOSPITAL_ID);
        createRequest.setBranchId(BRANCH_ID);
        createRequest.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        createRequest.setEncounterType("OPD");
        createRequest.setVisitReason("Vitals check");

        MvcResult createResult = mockMvc.perform(post("/api/v1/clinical/encounters")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String encounterId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("encounterId").asText();

        RecordClinicalVitalsRequest empty = new RecordClinicalVitalsRequest();
        empty.setRecordedAt(Instant.parse("2026-08-21T10:00:00Z"));
        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/vitals")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(empty)))
                .andExpect(status().isBadRequest());

        RecordClinicalVitalsRequest vitals = new RecordClinicalVitalsRequest();
        vitals.setSystolicBp(120);
        vitals.setDiastolicBp(80);
        vitals.setHeartRate(72);
        vitals.setTemperature(new BigDecimal("36.8"));
        vitals.setRespiratoryRate(16);
        vitals.setSpo2(98);
        vitals.setNotes("Pre-consult");
        vitals.setRecordedAt(Instant.parse("2026-08-21T10:05:00Z"));

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/vitals")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vitals)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.encounterId").value(encounterId))
                .andExpect(jsonPath("$.data.systolicBp").value(120))
                .andExpect(jsonPath("$.data.bpClassification").value("NORMAL"));

        mockMvc.perform(get("/api/v1/clinical/encounters/" + encounterId + "/vitals")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].heartRate").value(72));
    }
}
