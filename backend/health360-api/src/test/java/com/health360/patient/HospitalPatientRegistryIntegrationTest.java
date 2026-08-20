package com.health360.patient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.hospital.presentation.dto.request.InviteStaffRequest;
import com.health360.patient.presentation.dto.request.RegisterHospitalPatientRequest;
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

import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class HospitalPatientRegistryIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
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
    void receptionistRegistersPatientWithUhidAndDetectsDuplicate() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);
        String receptionistEmail = "receptionist.p1f1." + System.currentTimeMillis() + "@health360.test";
        String mobile = "98765" + (System.currentTimeMillis() % 100000L);

        InviteStaffRequest inviteRequest = new InviteStaffRequest();
        inviteRequest.setEmail(receptionistEmail);
        inviteRequest.setFirstName("Reception");
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

        RegisterHospitalPatientRequest registerRequest = new RegisterHospitalPatientRequest();
        registerRequest.setLegalFirstName("Asha");
        registerRequest.setLegalLastName("Patil");
        registerRequest.setDateOfBirth(LocalDate.of(1990, 5, 15));
        registerRequest.setGender("FEMALE");
        registerRequest.setPrimaryPhone(mobile);
        registerRequest.setPermanentCity("Pune");
        registerRequest.setPermanentState("MH");

        MvcResult registerResult = mockMvc.perform(post("/api/v1/hospital/patients/register")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.uhid").exists())
                .andReturn();

        String uhid = objectMapper.readTree(registerResult.getResponse().getContentAsString())
                .path("data").path("uhid").asText();

        mockMvc.perform(get("/api/v1/hospital/patients/search")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .param("uhid", uhid))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].uhid").value(uhid));

        RegisterHospitalPatientRequest duplicateRequest = new RegisterHospitalPatientRequest();
        duplicateRequest.setLegalFirstName("Different");
        duplicateRequest.setLegalLastName("Person");
        duplicateRequest.setDateOfBirth(LocalDate.of(1988, 1, 1));
        duplicateRequest.setGender("MALE");
        duplicateRequest.setPrimaryPhone(mobile);

        mockMvc.perform(post("/api/v1/hospital/patients/register")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.data.candidates[0].matchReason").value("MOBILE_EXACT"));
    }
}
