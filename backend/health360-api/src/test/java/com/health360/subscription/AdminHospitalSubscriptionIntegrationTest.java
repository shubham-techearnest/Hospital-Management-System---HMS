package com.health360.subscription;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.doctor.presentation.dto.request.InviteDoctorRequest;
import com.health360.hospital.presentation.dto.request.CreateAdminHospitalRequest;
import com.health360.hospital.presentation.dto.request.CreateHospitalProfileRequest;
import com.health360.subscription.presentation.dto.request.ChangeHospitalPlanRequest;
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

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class AdminHospitalSubscriptionIntegrationTest {

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
    void adminCreatesHospitalAndInvitesDoctor() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, IntegrationTestAuth.PLATFORM_ADMIN_EMAIL);
        long suffix = System.currentTimeMillis();

        CreateAdminHospitalRequest createRequest = buildCreateHospitalRequest(
                "Integration Hospital " + suffix,
                "REG-INT-" + suffix,
                "FREE",
                "hospital.admin.int." + suffix + "@health360.test");

        MvcResult createResult = mockMvc.perform(post("/api/v1/admin/hospitals")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.subscription.planCode").value("FREE"))
                .andReturn();

        UUID hospitalId = UUID.fromString(
                objectMapper.readTree(createResult.getResponse().getContentAsString())
                        .path("data")
                        .path("id")
                        .asText());

        InviteDoctorRequest inviteRequest = buildInviteRequest(
                "doctor.one." + suffix + "@health360.test", "One", "Doctor");

        mockMvc.perform(post("/api/v1/admin/hospitals/{hospitalId}/doctors/invite", hospitalId)
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(inviteRequest.getEmail()));

        mockMvc.perform(get("/api/v1/admin/hospitals/{hospitalId}", hospitalId)
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.doctorCount").value(1));
    }

    @Test
    void secondDoctorInviteOnFreePlanReturns409() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, IntegrationTestAuth.PLATFORM_ADMIN_EMAIL);
        long suffix = System.currentTimeMillis();
        UUID hospitalId = createHospital(adminToken, suffix, "FREE");

        mockMvc.perform(post("/api/v1/admin/hospitals/{hospitalId}/doctors/invite", hospitalId)
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildInviteRequest(
                                "doctor.a." + suffix + "@health360.test", "Alpha", "Doctor"))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/admin/hospitals/{hospitalId}/doctors/invite", hospitalId)
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildInviteRequest(
                                "doctor.b." + suffix + "@health360.test", "Beta", "Doctor"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("DOCTOR_LIMIT_REACHED"));
    }

    @Test
    void hospitalAdminCannotSelfCreateProfile() throws Exception {
        String hospitalAdminToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, IntegrationTestAuth.HOSPITAL_ADMIN_EMAIL);

        CreateHospitalProfileRequest profileRequest = new CreateHospitalProfileRequest(
                "Self Registered Clinic",
                "REG-SELF-" + System.currentTimeMillis(),
                "CLINIC",
                2020,
                10,
                null,
                "Should be blocked");

        mockMvc.perform(post("/api/v1/hospitals/me/profile")
                        .header("Authorization", IntegrationTestAuth.bearer(hospitalAdminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("HOSPITAL_SELF_REGISTRATION_DISABLED"));
    }

    @Test
    void hospitalAdminCannotInviteDoctor() throws Exception {
        String hospitalAdminToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, IntegrationTestAuth.HOSPITAL_ADMIN_EMAIL);
        long suffix = System.currentTimeMillis();

        InviteDoctorRequest inviteRequest = buildInviteRequest(
                "blocked.invite." + suffix + "@health360.test", "Blocked", "Invite");

        mockMvc.perform(post("/api/v1/hospitals/me/doctors/invite")
                        .header("Authorization", IntegrationTestAuth.bearer(hospitalAdminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("DOCTOR_PROVISIONING_ADMIN_ONLY"));
    }

    @Test
    void planChangeFromFreeToStarterRecordsUpgradeHistory() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, IntegrationTestAuth.PLATFORM_ADMIN_EMAIL);
        long suffix = System.currentTimeMillis();
        UUID hospitalId = createHospital(adminToken, suffix, "FREE");

        ChangeHospitalPlanRequest changeRequest = new ChangeHospitalPlanRequest();
        changeRequest.setPlanCode("STARTER");
        changeRequest.setNotes("Integration test upgrade");

        mockMvc.perform(put("/api/v1/admin/hospitals/{hospitalId}/subscription/plan", hospitalId)
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.planCode").value("STARTER"));

        mockMvc.perform(get("/api/v1/admin/hospitals/{hospitalId}/subscription/history", hospitalId)
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data[*].eventType").value(hasItem("UPGRADE")))
                .andExpect(jsonPath("$.data[*].planCode").value(hasItem("STARTER")));
    }

    @Test
    void downgradeBlockedWhenDoctorCountExceedsFreeLimit() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, IntegrationTestAuth.PLATFORM_ADMIN_EMAIL);
        long suffix = System.currentTimeMillis();
        UUID hospitalId = createHospital(adminToken, suffix, "STARTER");

        inviteDoctor(adminToken, hospitalId, "doctor.one." + suffix + "@health360.test", "One", "Doctor");
        inviteDoctor(adminToken, hospitalId, "doctor.two." + suffix + "@health360.test", "Two", "Doctor");

        ChangeHospitalPlanRequest downgradeRequest = new ChangeHospitalPlanRequest();
        downgradeRequest.setPlanCode("FREE");
        downgradeRequest.setNotes("Should be blocked");

        mockMvc.perform(put("/api/v1/admin/hospitals/{hospitalId}/subscription/plan", hospitalId)
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(downgradeRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("PLAN_DOWNGRADE_NOT_ALLOWED"));
    }

    private UUID createHospital(String adminToken, long suffix, String planCode) throws Exception {
        CreateAdminHospitalRequest createRequest = buildCreateHospitalRequest(
                "Limit Test Hospital " + suffix,
                "REG-LIM-" + suffix,
                planCode,
                "hospital.limit." + suffix + "@health360.test");

        MvcResult result = mockMvc.perform(post("/api/v1/admin/hospitals")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode data = objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
        return UUID.fromString(data.path("id").asText());
    }

    private void inviteDoctor(
            String adminToken, UUID hospitalId, String email, String firstName, String lastName) throws Exception {
        mockMvc.perform(post("/api/v1/admin/hospitals/{hospitalId}/doctors/invite", hospitalId)
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildInviteRequest(email, firstName, lastName))))
                .andExpect(status().isCreated());
    }

    private CreateAdminHospitalRequest buildCreateHospitalRequest(
            String name, String registrationNumber, String planCode, String adminEmail) {
        CreateAdminHospitalRequest request = new CreateAdminHospitalRequest();
        request.setName(name);
        request.setRegistrationNumber(registrationNumber);
        request.setHospitalType("CLINIC");
        request.setEstablishedYear(2020);
        request.setTotalBedCount(20);
        request.setAdminEmail(adminEmail);
        request.setAdminFirstName("Hospital");
        request.setAdminLastName("Admin");
        request.setAdminPhone("9876543210");
        request.setAdminPassword("TempP@ss1!");
        request.setPlanCode(planCode);
        return request;
    }

    private InviteDoctorRequest buildInviteRequest(String email, String firstName, String lastName) {
        InviteDoctorRequest request = new InviteDoctorRequest();
        request.setEmail(email);
        request.setFirstName(firstName);
        request.setLastName(lastName);
        request.setPhone("9123456789");
        request.setPassword("DoctorP@ss1!");
        return request;
    }
}
