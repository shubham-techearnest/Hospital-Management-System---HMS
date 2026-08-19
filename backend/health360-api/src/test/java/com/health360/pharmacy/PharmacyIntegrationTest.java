package com.health360.pharmacy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.clinical.presentation.dto.request.CreateClinicalOrderRequest;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.pharmacy.presentation.dto.request.*;
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

import java.util.List;
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
class PharmacyIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID PATIENT_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private static final UUID DOCTOR_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000063");
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
    void medicationOrderVerifyAdministerAndMarFlow() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);
        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        CreateMedicineRequest medicineRequest = new CreateMedicineRequest();
        medicineRequest.setHospitalId(HOSPITAL_ID);
        medicineRequest.setBranchId(BRANCH_ID);
        medicineRequest.setCode("PCM-500");
        medicineRequest.setName("Paracetamol 500mg");
        medicineRequest.setForm("TABLET");
        medicineRequest.setStrength("500mg");
        medicineRequest.setDefaultRoute("ORAL");

        MvcResult medicineResult = mockMvc.perform(post("/api/v1/pharmacy/medicines")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(medicineRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String medicineId = objectMapper.readTree(medicineResult.getResponse().getContentAsString())
                .path("data").path("medicineId").asText();

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(PATIENT_PROFILE_ID);
        encounterRequest.setHospitalId(HOSPITAL_ID);
        encounterRequest.setBranchId(BRANCH_ID);
        encounterRequest.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        encounterRequest.setEncounterType("IPD");
        encounterRequest.setVisitReason("Post-op pain management");

        MvcResult encounterResult = mockMvc.perform(post("/api/v1/clinical/encounters")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(encounterRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String encounterId = objectMapper.readTree(encounterResult.getResponse().getContentAsString())
                .path("data").path("encounterId").asText();

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/start")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk());

        CreateClinicalOrderRequest orderRequest = new CreateClinicalOrderRequest();
        orderRequest.setOrderType("MEDICATION");
        orderRequest.setInstructions("Take with food");

        CreateClinicalOrderRequest.OrderItemRequest item = new CreateClinicalOrderRequest.OrderItemRequest();
        item.setItemCode("PCM-500");
        item.setItemName("Paracetamol 500mg");
        item.setItemReferenceId(UUID.fromString(medicineId));
        orderRequest.setItems(List.of(item));

        MvcResult orderResult = mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/orders")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String clinicalOrderId = objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data").path("orderId").asText();

        CreateMedicationOrderRequest receiveRequest = new CreateMedicationOrderRequest();
        receiveRequest.setClinicalOrderId(UUID.fromString(clinicalOrderId));

        MvcResult medicationOrderResult = mockMvc.perform(post("/api/v1/pharmacy/orders")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(receiveRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("RECEIVED"))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andReturn();

        String medicationOrderId = objectMapper.readTree(medicationOrderResult.getResponse().getContentAsString())
                .path("data").path("medicationOrderId").asText();
        String orderItemId = objectMapper.readTree(medicationOrderResult.getResponse().getContentAsString())
                .path("data").path("items").get(0).path("orderItemId").asText();

        mockMvc.perform(post("/api/v1/pharmacy/orders/" + medicationOrderId + "/verify")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("VERIFIED"));

        PlanMedicationOrderItemRequest planRequest = new PlanMedicationOrderItemRequest();
        planRequest.setDoseText("500mg");
        planRequest.setRoute("ORAL");
        planRequest.setFrequency("TDS");
        planRequest.setDurationDays(5);

        mockMvc.perform(post("/api/v1/pharmacy/order-items/" + orderItemId + "/plan")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.items[0].status").value("READY"));

        AdministerMedicationRequest administerRequest = new AdministerMedicationRequest();
        administerRequest.setDoseGiven("500mg");
        administerRequest.setRoute("ORAL");
        administerRequest.setNotes("Patient tolerated well");

        mockMvc.perform(post("/api/v1/pharmacy/order-items/" + orderItemId + "/administer")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(administerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.doseGiven").value("500mg"))
                .andExpect(jsonPath("$.data.encounterId").value(encounterId));

        mockMvc.perform(post("/api/v1/pharmacy/order-items/" + orderItemId + "/complete")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        mockMvc.perform(get("/api/v1/pharmacy/encounters/" + encounterId + "/administrations")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].medicineName").value("Paracetamol 500mg"));
    }
}
