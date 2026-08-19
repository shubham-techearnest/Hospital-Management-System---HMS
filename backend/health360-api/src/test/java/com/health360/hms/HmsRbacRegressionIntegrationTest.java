package com.health360.hms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.support.IntegrationTestAuth;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HMS-11 RBAC regression matrix — each role reaches allowed endpoints and is denied elsewhere.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class HmsRbacRegressionIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final String HOSPITAL_ADMIN_EMAIL = "hospital.admin@health360.test";
    private static final String DOCTOR_EMAIL = "siddharth.deshmukh@health360.test";
    private static final String PATIENT_EMAIL = "shubham@gmail.com";
    private static final String PATIENT_PASSWORD = "Kadam@123";
    private static final String PLATFORM_ADMIN_EMAIL = "platform.admin@health360.test";

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
    void hospitalAdmin_canAccessHospitalDashboardAndStaffList() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        mockMvc.perform(get("/api/v1/hospital/dashboard")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.hospitalId").value(HOSPITAL_ID.toString()));

        mockMvc.perform(get("/api/v1/hospital/staff")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .param("hospitalId", HOSPITAL_ID.toString()))
                .andExpect(status().isOk());
    }

    @Test
    void hospitalAdmin_cannotAccessPlatformAdminUsers() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isForbidden());
    }

    @Test
    void doctor_canAccessClinicalWorklistAndDashboard() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        mockMvc.perform(get("/api/v1/doctor/dashboard")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.doctorId").exists());

        mockMvc.perform(get("/api/v1/clinical/encounters/doctor/me")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void doctor_cannotInviteStaff() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        mockMvc.perform(get("/api/v1/hospital/staff")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .param("hospitalId", HOSPITAL_ID.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    void patient_canAccessOwnEncountersAndClinicalDashboard() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, PATIENT_EMAIL, PATIENT_PASSWORD);

        mockMvc.perform(get("/api/v1/clinical/encounters/me")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());

        mockMvc.perform(get("/api/v1/patient/dashboard/clinical")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.patientId").exists());
    }

    @Test
    void patient_cannotAccessHospitalAdminEndpoints() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, PATIENT_EMAIL, PATIENT_PASSWORD);

        mockMvc.perform(get("/api/v1/hospital/dashboard")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/hospitals/me/profile")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isForbidden());
    }

    @Test
    void platformAdmin_canAccessAdminUsers() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, PLATFORM_ADMIN_EMAIL);

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isOk());
    }

    @Test
    void hospitalAdmin_canAccessOpdDashboardForOwnHospital() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        mockMvc.perform(get("/api/v1/opd/dashboard")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalTodayCount").isNumber());
    }

    @Test
    void unauthenticatedRequestsReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/clinical/encounters/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/hospital/dashboard"))
                .andExpect(status().isUnauthorized());
    }
}
