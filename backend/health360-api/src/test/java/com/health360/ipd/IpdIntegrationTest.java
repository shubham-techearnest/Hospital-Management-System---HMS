package com.health360.ipd;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.ipd.presentation.dto.request.CreateIpdAdmissionRequest;
import com.health360.ipd.presentation.dto.request.CreateIpdBedRequest;
import com.health360.ipd.presentation.dto.request.CreateIpdRoomRequest;
import com.health360.ipd.presentation.dto.request.CreateIpdWardRequest;
import com.health360.ipd.presentation.dto.request.CreateIpdRoundRequest;
import com.health360.ipd.presentation.dto.request.DischargeIpdPatientRequest;
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
class IpdIntegrationTest {

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
    void wardBedAdmissionRoundAndDischargeFlow() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        CreateIpdWardRequest wardRequest = new CreateIpdWardRequest();
        wardRequest.setHospitalId(HOSPITAL_ID);
        wardRequest.setBranchId(BRANCH_ID);
        wardRequest.setName("General Ward A");
        wardRequest.setCode("GWA");

        MvcResult wardResult = mockMvc.perform(post("/api/v1/ipd/wards")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wardRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("GWA"))
                .andReturn();

        String wardId = objectMapper.readTree(wardResult.getResponse().getContentAsString())
                .path("data").path("wardId").asText();

        CreateIpdRoomRequest roomRequest = new CreateIpdRoomRequest();
        roomRequest.setWardId(UUID.fromString(wardId));
        roomRequest.setName("Room 101");
        roomRequest.setCode("101");

        MvcResult roomResult = mockMvc.perform(post("/api/v1/ipd/rooms")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roomRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String roomId = objectMapper.readTree(roomResult.getResponse().getContentAsString())
                .path("data").path("roomId").asText();

        CreateIpdBedRequest bedRequest = new CreateIpdBedRequest();
        bedRequest.setRoomId(UUID.fromString(roomId));
        bedRequest.setBedNumber("A1");

        MvcResult bedResult = mockMvc.perform(post("/api/v1/ipd/beds")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bedRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"))
                .andReturn();

        String bedId = objectMapper.readTree(bedResult.getResponse().getContentAsString())
                .path("data").path("bedId").asText();

        CreateIpdAdmissionRequest admissionRequest = new CreateIpdAdmissionRequest();
        admissionRequest.setPatientId(PATIENT_PROFILE_ID);
        admissionRequest.setHospitalId(HOSPITAL_ID);
        admissionRequest.setBranchId(BRANCH_ID);
        admissionRequest.setBedId(UUID.fromString(bedId));
        admissionRequest.setAdmissionReason("Observation");

        MvcResult admissionResult = mockMvc.perform(post("/api/v1/ipd/admissions")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(admissionRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ADMITTED"))
                .andExpect(jsonPath("$.data.encounterStatus").value("IN_PROGRESS"))
                .andReturn();

        JsonNode admission = objectMapper.readTree(admissionResult.getResponse().getContentAsString()).path("data");
        String admissionId = admission.path("admissionId").asText();

        mockMvc.perform(get("/api/v1/ipd/beds")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString())
                        .param("status", "OCCUPIED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(org.hamcrest.Matchers.greaterThanOrEqualTo(1))));

        CreateIpdRoundRequest roundRequest = new CreateIpdRoundRequest();
        roundRequest.setRoundType("NURSING");
        roundRequest.setNotes("Vitals stable");

        mockMvc.perform(post("/api/v1/ipd/admissions/" + admissionId + "/rounds")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roundRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.roundType").value("NURSING"));

        DischargeIpdPatientRequest dischargeRequest = new DischargeIpdPatientRequest();
        dischargeRequest.setSummaryText("Recovered well, fit for discharge");
        dischargeRequest.setFollowUpPlan("OPD follow-up in 1 week");

        mockMvc.perform(post("/api/v1/ipd/admissions/" + admissionId + "/discharge")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dischargeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.admissionStatus").value("DISCHARGED"))
                .andExpect(jsonPath("$.data.encounterStatus").value("COMPLETED"));

        mockMvc.perform(get("/api/v1/ipd/beds")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString())
                        .param("status", "AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(org.hamcrest.Matchers.greaterThanOrEqualTo(1))));
    }
}
