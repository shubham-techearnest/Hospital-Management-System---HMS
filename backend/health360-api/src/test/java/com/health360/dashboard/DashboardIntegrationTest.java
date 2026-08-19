package com.health360.dashboard;

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

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class DashboardIntegrationTest {

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
    void hospitalAdminGetsAggregatedHospitalDashboard() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        mockMvc.perform(get("/api/v1/hospital/dashboard")
                        .header("Authorization", IntegrationTestAuth.bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.hospitalId").value(HOSPITAL_ID.toString()))
                .andExpect(jsonPath("$.data.branchId").value(BRANCH_ID.toString()))
                .andExpect(jsonPath("$.data.branchCount").isNumber())
                .andExpect(jsonPath("$.data.doctorCount").isNumber());
    }

    @Test
    void hospitalAdminGetsOpdDashboardInSingleCall() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        mockMvc.perform(get("/api/v1/opd/dashboard")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.hospitalId").value(HOSPITAL_ID.toString()))
                .andExpect(jsonPath("$.data.deskCount").isNumber())
                .andExpect(jsonPath("$.data.totalTodayCount").isNumber());
    }
}
