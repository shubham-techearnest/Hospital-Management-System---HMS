package com.health360.scheduling;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.support.IntegrationTestAuth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
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
class AppointmentListIntegrationTest {

    private static final UUID TENANT_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final String PASSWORD_HASH =
            "$2a$12$t2j3c6vGKiRZuY4vub7GkeqXN4DrT11TjNB6McxulQoKiKkMEK7Wi";

    private static final UUID PATIENT_WITH_PROFILE_USER = UUID.fromString("00000000-0000-0000-0000-000000000090");
    private static final UUID PATIENT_WITH_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000091");
    private static final UUID PATIENT_WITHOUT_PROFILE_USER = UUID.fromString("00000000-0000-0000-0000-000000000092");

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

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void seedPatients() {
        insertPatientUser(
                PATIENT_WITH_PROFILE_USER,
                PATIENT_WITH_PROFILE_ID,
                "patient.with.profile@health360.test",
                true);
        insertPatientUser(
                PATIENT_WITHOUT_PROFILE_USER,
                null,
                "patient.without.profile@health360.test",
                false);
    }

    @Test
    void listMyAppointments_emptyUpcoming_returns200PagedEmpty() throws Exception {
        String token = login("patient.with.profile@health360.test");
        assertEmptyFilter(token, "upcoming");
    }

    @Test
    void listMyAppointments_emptyPast_returns200PagedEmpty() throws Exception {
        String token = login("patient.with.profile@health360.test");
        assertEmptyFilter(token, "past");
    }

    @Test
    void listMyAppointments_emptyCancelled_returns200PagedEmpty() throws Exception {
        String token = login("patient.with.profile@health360.test");
        assertEmptyFilter(token, "cancelled");
    }

    @Test
    void listMyAppointments_withoutPatientProfile_returns200PagedEmpty() throws Exception {
        String token = login("patient.without.profile@health360.test");
        assertEmptyFilter(token, "upcoming");
    }

    @Test
    void listMyAppointments_invalidFilter_returns400() throws Exception {
        String token = login("patient.with.profile@health360.test");
        mockMvc.perform(get("/api/v1/scheduling/appointments/me")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .param("filter", "invalid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    private void assertEmptyFilter(String token, String filter) throws Exception {
        mockMvc.perform(get("/api/v1/scheduling/appointments/me")
                        .header("Authorization", IntegrationTestAuth.bearer(token))
                        .param("filter", filter)
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(0))
                .andExpect(jsonPath("$.data.totalElements").value(0))
                .andExpect(jsonPath("$.data.totalPages").value(0))
                .andExpect(jsonPath("$.data.size").value(20))
                .andExpect(jsonPath("$.data.number").value(0));
    }

    private String login(String email) throws Exception {
        return IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, email, IntegrationTestAuth.DEV_PASSWORD);
    }

    private void insertPatientUser(UUID userId, UUID profileId, String email, boolean withProfile) {
        jdbcTemplate.update(
                """
                INSERT INTO iam.users (
                    id, tenant_id, email, password_hash,
                    first_name, last_name, phone,
                    status, email_verified, email_verified_at
                )
                VALUES (?, ?, ?, ?, 'Patient', 'Test', '9876500300', 'ACTIVE', TRUE, NOW())
                ON CONFLICT (id) DO NOTHING
                """,
                userId,
                TENANT_ID,
                email,
                PASSWORD_HASH);

        jdbcTemplate.update(
                """
                INSERT INTO iam.user_roles (id, tenant_id, user_id, role_id)
                VALUES (?, ?, ?, '00000000-0000-0000-0000-000000000010')
                ON CONFLICT (id) DO NOTHING
                """,
                userId,
                TENANT_ID,
                userId);

        if (withProfile && profileId != null) {
            jdbcTemplate.update(
                    """
                    INSERT INTO patient.patient_profiles (
                        id, tenant_id, user_id, consent_accepted, consent_accepted_at,
                        created_by, updated_by
                    )
                    VALUES (?, ?, ?, TRUE, NOW(), ?, ?)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    profileId,
                    TENANT_ID,
                    userId,
                    userId,
                    userId);
        }
    }
}
