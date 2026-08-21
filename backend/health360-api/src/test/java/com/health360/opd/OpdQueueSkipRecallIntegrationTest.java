package com.health360.opd;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.opd.presentation.dto.request.WalkInRegistrationRequest;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class OpdQueueSkipRecallIntegrationTest {

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
    void skipAndRecallQueueEntry() throws Exception {
        String token = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        WalkInRegistrationRequest walkInRequest = new WalkInRegistrationRequest();
        walkInRequest.setPatientId(PATIENT_PROFILE_ID);
        walkInRequest.setHospitalId(HOSPITAL_ID);
        walkInRequest.setBranchId(BRANCH_ID);
        walkInRequest.setVisitReason("Skip recall test");

        MvcResult registrationResult = mockMvc.perform(post("/api/v1/opd/registrations/walk-in")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(walkInRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String queueEntryId = objectMapper.readTree(registrationResult.getResponse().getContentAsString())
                .path("data").path("queueEntry").path("queueEntryId").asText();

        mockMvc.perform(post("/api/v1/opd/queue/" + queueEntryId + "/call")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CALLED"));

        mockMvc.perform(post("/api/v1/opd/queue/" + queueEntryId + "/skip")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "Patient not responding"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SKIPPED"));

        mockMvc.perform(post("/api/v1/opd/queue/" + queueEntryId + "/recall")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CALLED"))
                .andExpect(jsonPath("$.data.priority").value(10));

        mockMvc.perform(post("/api/v1/opd/queue/" + queueEntryId + "/start")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_SERVICE"));

        mockMvc.perform(post("/api/v1/opd/queue/" + queueEntryId + "/skip")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
