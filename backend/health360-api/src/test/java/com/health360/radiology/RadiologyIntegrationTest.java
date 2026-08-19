package com.health360.radiology;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.clinical.presentation.dto.request.CreateClinicalOrderRequest;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.radiology.presentation.dto.request.*;
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
class RadiologyIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID PATIENT_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private static final UUID DOCTOR_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000063");
    private static final String HOSPITAL_ADMIN_EMAIL = "hospital.admin@health360.test";
    private static final String DOCTOR_EMAIL = "siddharth.deshmukh@health360.test";
    private static final String PATIENT_EMAIL = "shubham@gmail.com";

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
    void modalityClinicalOrderFulfillmentAndReleaseFlow() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);
        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        CreateImagingModalityRequest modalityRequest = new CreateImagingModalityRequest();
        modalityRequest.setHospitalId(HOSPITAL_ID);
        modalityRequest.setBranchId(BRANCH_ID);
        modalityRequest.setCode("CXR");
        modalityRequest.setName("Chest X-Ray");
        modalityRequest.setModalityType("X_RAY");

        MvcResult modalityResult = mockMvc.perform(post("/api/v1/radiology/modalities")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(modalityRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.modalityType").value("X_RAY"))
                .andReturn();

        String modalityId = objectMapper.readTree(modalityResult.getResponse().getContentAsString())
                .path("data").path("modalityId").asText();

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(PATIENT_PROFILE_ID);
        encounterRequest.setHospitalId(HOSPITAL_ID);
        encounterRequest.setBranchId(BRANCH_ID);
        encounterRequest.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        encounterRequest.setEncounterType("OPD");
        encounterRequest.setVisitReason("Chest pain evaluation");

        MvcResult encounterResult = mockMvc.perform(post("/api/v1/clinical/encounters")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(encounterRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String encounterId = objectMapper.readTree(encounterResult.getResponse().getContentAsString())
                .path("data").path("encounterId").asText();

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/start")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk());

        CreateClinicalOrderRequest orderRequest = new CreateClinicalOrderRequest();
        orderRequest.setOrderType("IMAGING");
        orderRequest.setInstructions("PA view");

        CreateClinicalOrderRequest.OrderItemRequest item = new CreateClinicalOrderRequest.OrderItemRequest();
        item.setItemCode("CXR");
        item.setItemName("Chest X-Ray");
        item.setItemReferenceId(UUID.fromString(modalityId));
        orderRequest.setItems(List.of(item));

        MvcResult orderResult = mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/orders")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andReturn();

        String clinicalOrderItemId = objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data").path("items").get(0).path("itemId").asText();

        mockMvc.perform(get("/api/v1/radiology/worklist/pending")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));

        CreateImagingOrderRequest imagingOrderRequest = new CreateImagingOrderRequest();
        imagingOrderRequest.setClinicalOrderItemId(UUID.fromString(clinicalOrderItemId));

        MvcResult imagingOrderResult = mockMvc.perform(post("/api/v1/radiology/orders")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(imagingOrderRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("RECEIVED"))
                .andReturn();

        String imagingOrderId = objectMapper.readTree(imagingOrderResult.getResponse().getContentAsString())
                .path("data").path("imagingOrderId").asText();

        ScheduleImagingStudyRequest scheduleRequest = new ScheduleImagingStudyRequest();
        scheduleRequest.setNotes("Morning slot");

        mockMvc.perform(post("/api/v1/radiology/orders/" + imagingOrderId + "/schedule")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scheduleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SCHEDULED"));

        PerformImagingStudyRequest performRequest = new PerformImagingStudyRequest();
        performRequest.setNotes("Study completed without complication");

        mockMvc.perform(post("/api/v1/radiology/orders/" + imagingOrderId + "/perform")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(performRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PERFORMED"));

        EnterImagingReportRequest reportRequest = new EnterImagingReportRequest();
        reportRequest.setFindingsText("Clear lung fields. No cardiomegaly.");
        reportRequest.setImpressionText("Normal chest radiograph.");

        mockMvc.perform(post("/api/v1/radiology/orders/" + imagingOrderId + "/report")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reportRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REPORT_DRAFT"));

        mockMvc.perform(post("/api/v1/radiology/orders/" + imagingOrderId + "/verify")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("VERIFIED"));

        ReleaseImagingReportRequest releaseRequest = new ReleaseImagingReportRequest();

        mockMvc.perform(post("/api/v1/radiology/orders/" + imagingOrderId + "/release")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(releaseRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.modalityCode").value("CXR"));

        mockMvc.perform(get("/api/v1/radiology/encounters/" + encounterId + "/reports")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].modalityName").value("Chest X-Ray"));

        String patientToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, PATIENT_EMAIL, "Kadam@123");

        mockMvc.perform(get("/api/v1/radiology/encounters/" + encounterId + "/reports")
                        .header("Authorization", IntegrationTestAuth.bearer(patientToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }
}
