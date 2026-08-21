package com.health360.clinical;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.clinical.presentation.dto.request.CreatePrescriptionRequest;
import com.health360.clinical.presentation.dto.request.UpdatePrescriptionRequest;
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

import java.util.List;
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
class EPrescriptionIntegrationTest {

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
    void createUpdateAndSignPrescription() throws Exception {
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

        CreatePrescriptionRequest.PrescriptionItemRequest item = new CreatePrescriptionRequest.PrescriptionItemRequest();
        item.setMedicineName("Paracetamol 500mg");
        item.setDoseText("1 tablet");
        item.setRoute("ORAL");
        item.setFrequency("TDS");
        item.setDurationDays(3);
        item.setQuantity(9);

        CreatePrescriptionRequest rxRequest = new CreatePrescriptionRequest();
        rxRequest.setNotes("Take after food");
        rxRequest.setItems(List.of(item));

        MvcResult rxResult = mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/prescriptions")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rxRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.items[0].medicineName").value("Paracetamol 500mg"))
                .andReturn();

        String prescriptionId = objectMapper.readTree(rxResult.getResponse().getContentAsString())
                .path("data").path("prescriptionId").asText();

        CreatePrescriptionRequest.PrescriptionItemRequest updatedItem =
                new CreatePrescriptionRequest.PrescriptionItemRequest();
        updatedItem.setMedicineName("Paracetamol 500mg");
        updatedItem.setDoseText("1 tablet");
        updatedItem.setFrequency("BD");
        updatedItem.setDurationDays(5);
        updatedItem.setQuantity(10);

        UpdatePrescriptionRequest updateRequest = new UpdatePrescriptionRequest();
        updateRequest.setNotes("Updated instructions");
        updateRequest.setItems(List.of(updatedItem));

        mockMvc.perform(put("/api/v1/clinical/encounters/" + encounterId + "/prescriptions/" + prescriptionId)
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.items[0].frequency").value("BD"));

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId
                        + "/prescriptions/" + prescriptionId + "/sign")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SIGNED"))
                .andExpect(jsonPath("$.data.signedAt").exists());

        mockMvc.perform(put("/api/v1/clinical/encounters/" + encounterId + "/prescriptions/" + prescriptionId)
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isConflict());
    }
}
