package com.health360.asset;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.asset.presentation.dto.request.CreateAssetMaintenanceRequest;
import com.health360.asset.presentation.dto.request.CreateAssetRequest;
import com.health360.asset.presentation.dto.request.UpdateAssetStatusRequest;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class AssetIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final String HOSPITAL_ADMIN_EMAIL = "hospital.admin@health360.test";
    private static final String DOCTOR_EMAIL = "siddharth.deshmukh@health360.test";

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
    void createAssetMaintenanceStatusAndDoctorDenied() throws Exception {
        String haToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);

        MvcResult categoriesResult = mockMvc.perform(get("/api/v1/assets/categories")
                        .header("Authorization", IntegrationTestAuth.bearer(haToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andReturn();

        JsonNode categories = objectMapper.readTree(categoriesResult.getResponse().getContentAsString()).path("data");
        String categoryId = categories.get(0).path("categoryId").asText();

        CreateAssetRequest create = new CreateAssetRequest();
        create.setHospitalId(HOSPITAL_ID);
        create.setBranchId(BRANCH_ID);
        create.setCategoryId(UUID.fromString(categoryId));
        create.setName("Philips Patient Monitor");
        create.setAssetTag("AST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        create.setManufacturer("Philips");
        create.setModel("IntelliVue MX40");
        create.setLocationLabel("Ward A / Nursing station");

        MvcResult createResult = mockMvc.perform(post("/api/v1/assets")
                        .header("Authorization", IntegrationTestAuth.bearer(haToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.data.assetTag").value(create.getAssetTag()))
                .andReturn();

        String assetId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("assetId").asText();

        mockMvc.perform(get("/api/v1/assets")
                        .header("Authorization", IntegrationTestAuth.bearer(haToken))
                        .param("hospitalId", HOSPITAL_ID.toString())
                        .param("branchId", BRANCH_ID.toString())
                        .param("q", create.getAssetTag()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].assetId").value(assetId));

        CreateAssetMaintenanceRequest maintenance = new CreateAssetMaintenanceRequest();
        maintenance.setMaintenanceType("PREVENTIVE");
        maintenance.setNotes("Annual PM completed");

        mockMvc.perform(post("/api/v1/assets/" + assetId + "/maintenance")
                        .header("Authorization", IntegrationTestAuth.bearer(haToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maintenance)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.maintenanceType").value("PREVENTIVE"));

        mockMvc.perform(get("/api/v1/assets/" + assetId)
                        .header("Authorization", IntegrationTestAuth.bearer(haToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("MAINTENANCE"));

        UpdateAssetStatusRequest statusRequest = new UpdateAssetStatusRequest();
        statusRequest.setStatus("AVAILABLE");
        mockMvc.perform(post("/api/v1/assets/" + assetId + "/status")
                        .header("Authorization", IntegrationTestAuth.bearer(haToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));

        statusRequest.setStatus("RETIRED");
        mockMvc.perform(post("/api/v1/assets/" + assetId + "/status")
                        .header("Authorization", IntegrationTestAuth.bearer(haToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RETIRED"));

        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);
        mockMvc.perform(post("/api/v1/assets")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isForbidden());
    }
}
