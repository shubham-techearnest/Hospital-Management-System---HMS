package com.health360.clinical;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.clinical.presentation.dto.request.CreateClinicalNoteRequest;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.clinical.presentation.dto.request.UpdateClinicalNoteRequest;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class StructuredConsultationIntegrationTest {

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
    void createUpdateAndFinalizeStructuredConsultation() throws Exception {
        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(PATIENT_PROFILE_ID);
        encounterRequest.setHospitalId(HOSPITAL_ID);
        encounterRequest.setBranchId(BRANCH_ID);
        encounterRequest.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        encounterRequest.setEncounterType("OPD");
        encounterRequest.setVisitReason("Fever");

        MvcResult createResult = mockMvc.perform(post("/api/v1/clinical/encounters")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(encounterRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String encounterId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("encounterId").asText();

        CreateClinicalNoteRequest noteRequest = new CreateClinicalNoteRequest();
        noteRequest.setChiefComplaint("Fever for 3 days");
        noteRequest.setHpi("High grade fever with chills");
        noteRequest.setExamination("Temp 101F, throat congested");
        noteRequest.setAssessment("Viral upper respiratory infection");
        noteRequest.setPlan("Supportive care, follow up in 3 days");

        MvcResult noteResult = mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/notes")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.noteType").value("CONSULTATION"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.chiefComplaint").value("Fever for 3 days"))
                .andReturn();

        String noteId = objectMapper.readTree(noteResult.getResponse().getContentAsString())
                .path("data").path("noteId").asText();

        UpdateClinicalNoteRequest updateRequest = new UpdateClinicalNoteRequest();
        updateRequest.setPlan("Supportive care, antipyretic, follow up in 3 days");

        mockMvc.perform(put("/api/v1/clinical/encounters/" + encounterId + "/notes/" + noteId)
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.plan").value("Supportive care, antipyretic, follow up in 3 days"));

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/notes/" + noteId + "/finalize")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("FINAL"))
                .andExpect(jsonPath("$.data.finalizedAt").exists());

        mockMvc.perform(put("/api/v1/clinical/encounters/" + encounterId + "/notes/" + noteId)
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isConflict());
    }
}
