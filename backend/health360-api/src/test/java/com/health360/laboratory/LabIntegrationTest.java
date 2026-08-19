package com.health360.laboratory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.clinical.presentation.dto.request.CreateClinicalOrderRequest;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.laboratory.presentation.dto.request.*;
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
class LabIntegrationTest {

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
    void catalogClinicalOrderFulfillmentAndReleaseFlow() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);
        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        CreateLaboratoryRequest labRequest = new CreateLaboratoryRequest();
        labRequest.setHospitalId(HOSPITAL_ID);
        labRequest.setBranchId(BRANCH_ID);
        labRequest.setName("Main Laboratory");
        labRequest.setCode("MAIN-LAB");

        MvcResult labResult = mockMvc.perform(post("/api/v1/lab/laboratories")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(labRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("MAIN-LAB"))
                .andReturn();

        String laboratoryId = objectMapper.readTree(labResult.getResponse().getContentAsString())
                .path("data").path("laboratoryId").asText();

        CreateLabTestRequest testRequest = new CreateLabTestRequest();
        testRequest.setLaboratoryId(UUID.fromString(laboratoryId));
        testRequest.setCode("CBC");
        testRequest.setName("Complete Blood Count");
        testRequest.setSpecimenType("BLOOD");

        MvcResult testResult = mockMvc.perform(post("/api/v1/lab/tests")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("CBC"))
                .andReturn();

        String labTestId = objectMapper.readTree(testResult.getResponse().getContentAsString())
                .path("data").path("labTestId").asText();

        CreateLabTestParameterRequest hbParam = new CreateLabTestParameterRequest();
        hbParam.setLabTestId(UUID.fromString(labTestId));
        hbParam.setCode("HB");
        hbParam.setName("Hemoglobin");
        hbParam.setUnit("g/dL");
        hbParam.setReferenceRange("12.0-16.0");

        MvcResult hbResult = mockMvc.perform(post("/api/v1/lab/tests/" + labTestId + "/parameters")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hbParam)))
                .andExpect(status().isCreated())
                .andReturn();

        String hbParameterId = objectMapper.readTree(hbResult.getResponse().getContentAsString())
                .path("data").path("parameterId").asText();

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(PATIENT_PROFILE_ID);
        encounterRequest.setHospitalId(HOSPITAL_ID);
        encounterRequest.setBranchId(BRANCH_ID);
        encounterRequest.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        encounterRequest.setEncounterType("OPD");
        encounterRequest.setVisitReason("Lab workup");

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
        orderRequest.setOrderType("LAB");
        orderRequest.setInstructions("Fasting not required");

        CreateClinicalOrderRequest.OrderItemRequest item = new CreateClinicalOrderRequest.OrderItemRequest();
        item.setItemCode("CBC");
        item.setItemName("Complete Blood Count");
        item.setItemReferenceId(UUID.fromString(labTestId));
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

        mockMvc.perform(get("/api/v1/lab/worklist/pending")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].clinicalOrderItemId").value(clinicalOrderItemId));

        CreateLabOrderRequest labOrderRequest = new CreateLabOrderRequest();
        labOrderRequest.setClinicalOrderItemId(UUID.fromString(clinicalOrderItemId));

        MvcResult labOrderResult = mockMvc.perform(post("/api/v1/lab/orders")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(labOrderRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("RECEIVED"))
                .andReturn();

        String labOrderId = objectMapper.readTree(labOrderResult.getResponse().getContentAsString())
                .path("data").path("labOrderId").asText();

        CollectLabSampleRequest sampleRequest = new CollectLabSampleRequest();
        sampleRequest.setSpecimenId("SPC-001");
        sampleRequest.setNotes("Morning draw");

        mockMvc.perform(post("/api/v1/lab/orders/" + labOrderId + "/collect-sample")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SAMPLE_COLLECTED"));

        EnterLabResultsRequest resultsRequest = new EnterLabResultsRequest();
        EnterLabResultsRequest.ResultEntry entry = new EnterLabResultsRequest.ResultEntry();
        entry.setParameterId(UUID.fromString(hbParameterId));
        entry.setValueText("14.2");
        entry.setValueNumeric(new BigDecimal("14.2"));
        resultsRequest.setResults(List.of(entry));

        mockMvc.perform(post("/api/v1/lab/orders/" + labOrderId + "/results")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resultsRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RESULTS_DRAFT"));

        mockMvc.perform(post("/api/v1/lab/orders/" + labOrderId + "/verify")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("VERIFIED"));

        ReleaseLabReportRequest releaseRequest = new ReleaseLabReportRequest();
        releaseRequest.setSummaryText("Within normal limits");

        mockMvc.perform(post("/api/v1/lab/orders/" + labOrderId + "/release")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(releaseRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.testCode").value("CBC"))
                .andExpect(jsonPath("$.data.results", hasSize(1)));

        mockMvc.perform(get("/api/v1/lab/encounters/" + encounterId + "/reports")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].testName").value("Complete Blood Count"));

        String patientToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, PATIENT_EMAIL, "Kadam@123");

        mockMvc.perform(get("/api/v1/lab/encounters/" + encounterId + "/reports")
                        .header("Authorization", IntegrationTestAuth.bearer(patientToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }
}
