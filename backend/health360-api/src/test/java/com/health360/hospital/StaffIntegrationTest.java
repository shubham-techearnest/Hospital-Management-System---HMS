package com.health360.hospital;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.hospital.presentation.dto.request.InviteStaffRequest;
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
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

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
class StaffIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID OTHER_HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000020");
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
    void receptionistCanAccessAssignedHospitalOpdQueueOnly() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        String receptionistEmail = "receptionist.hms9." + System.currentTimeMillis() + "@health360.test";

        InviteStaffRequest inviteRequest = new InviteStaffRequest();
        inviteRequest.setEmail(receptionistEmail);
        inviteRequest.setFirstName("Reception");
        inviteRequest.setLastName("Staff");
        inviteRequest.setTemporaryPassword("SecureP@ss1!");
        inviteRequest.setHospitalId(HOSPITAL_ID);
        inviteRequest.setBranchId(BRANCH_ID);
        inviteRequest.setRoleName("RECEPTIONIST");
        inviteRequest.setJobTitle("Front desk");

        mockMvc.perform(post("/api/v1/hospital/staff/invite")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.roles[0]").value("RECEPTIONIST"));

        String receptionistToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, receptionistEmail, "SecureP@ss1!");

        mockMvc.perform(get("/api/v1/opd/queue")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString())
                        .param("queueDate", "2030-01-01"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/opd/queue")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .param("hospitalId", OTHER_HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString())
                        .param("queueDate", "2030-01-01"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/hospital/staff")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .param("hospitalId", HOSPITAL_ID.toString()))
                .andExpect(status().isForbidden());
    }
}
