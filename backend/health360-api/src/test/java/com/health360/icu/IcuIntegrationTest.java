package com.health360.icu;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.icu.presentation.dto.request.*;
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

import java.util.Map;
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
class IcuIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID PATIENT_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000070");
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

    @Test
    void unitBedStayMonitoringEquipmentAndDischargeFlow() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        CreateIcuUnitRequest unitRequest = new CreateIcuUnitRequest();
        unitRequest.setHospitalId(HOSPITAL_ID);
        unitRequest.setBranchId(BRANCH_ID);
        unitRequest.setName("Main ICU");
        unitRequest.setCode("MICU");

        MvcResult unitResult = mockMvc.perform(post("/api/v1/icu/units")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unitRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("MICU"))
                .andReturn();

        String unitId = objectMapper.readTree(unitResult.getResponse().getContentAsString())
                .path("data").path("unitId").asText();

        CreateIcuBedRequest bedRequest = new CreateIcuBedRequest();
        bedRequest.setUnitId(UUID.fromString(unitId));
        bedRequest.setBedNumber("ICU-1");

        MvcResult bedResult = mockMvc.perform(post("/api/v1/icu/beds")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bedRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"))
                .andReturn();

        String bedId = objectMapper.readTree(bedResult.getResponse().getContentAsString())
                .path("data").path("bedId").asText();

        CreateIcuStayRequest stayRequest = new CreateIcuStayRequest();
        stayRequest.setPatientId(PATIENT_PROFILE_ID);
        stayRequest.setHospitalId(HOSPITAL_ID);
        stayRequest.setBranchId(BRANCH_ID);
        stayRequest.setBedId(UUID.fromString(bedId));
        stayRequest.setAdmissionReason("Post-operative critical care");

        MvcResult stayResult = mockMvc.perform(post("/api/v1/icu/stays")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stayRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.encounterStatus").value("IN_PROGRESS"))
                .andReturn();

        JsonNode stay = objectMapper.readTree(stayResult.getResponse().getContentAsString()).path("data");
        String stayId = stay.path("stayId").asText();

        CreateIcuMonitoringRecordRequest monitoringRequest = new CreateIcuMonitoringRecordRequest();
        monitoringRequest.setRecordType("VITALS");
        monitoringRequest.setPayload(Map.of("heartRate", 88, "spo2", 97));
        monitoringRequest.setNotes("Stable vitals");

        mockMvc.perform(post("/api/v1/icu/stays/" + stayId + "/monitoring-records")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(monitoringRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.recordType").value("VITALS"));

        CreateIcuEquipmentRequest equipmentRequest = new CreateIcuEquipmentRequest();
        equipmentRequest.setHospitalId(HOSPITAL_ID);
        equipmentRequest.setBranchId(BRANCH_ID);
        equipmentRequest.setUnitId(UUID.fromString(unitId));
        equipmentRequest.setName("Ventilator A");
        equipmentRequest.setCode("VENT-A");
        equipmentRequest.setEquipmentType("VENTILATOR");

        MvcResult equipmentResult = mockMvc.perform(post("/api/v1/icu/equipment")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(equipmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"))
                .andReturn();

        String equipmentId = objectMapper.readTree(equipmentResult.getResponse().getContentAsString())
                .path("data").path("equipmentId").asText();

        AssignIcuEquipmentRequest assignRequest = new AssignIcuEquipmentRequest();
        assignRequest.setStayId(UUID.fromString(stayId));
        assignRequest.setNotes("Primary ventilator");

        MvcResult assignResult = mockMvc.perform(post("/api/v1/icu/equipment/" + equipmentId + "/assign")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.active").value(true))
                .andReturn();

        String assignmentId = objectMapper.readTree(assignResult.getResponse().getContentAsString())
                .path("data").path("assignmentId").asText();

        mockMvc.perform(post("/api/v1/icu/equipment/" + equipmentId + "/assign")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignRequest)))
                .andExpect(status().isConflict());

        mockMvc.perform(post("/api/v1/icu/equipment-assignments/" + assignmentId + "/release")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        DischargeIcuStayRequest dischargeRequest = new DischargeIcuStayRequest();
        dischargeRequest.setSummaryText("Patient stable, transferred to ward");
        dischargeRequest.setFollowUpPlan("Continue monitoring in IPD");

        mockMvc.perform(post("/api/v1/icu/stays/" + stayId + "/discharge")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dischargeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stayStatus").value("DISCHARGED"))
                .andExpect(jsonPath("$.data.encounterStatus").value("COMPLETED"));

        mockMvc.perform(get("/api/v1/icu/beds")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString())
                        .param("status", "AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(org.hamcrest.Matchers.greaterThanOrEqualTo(1))));
    }
}
