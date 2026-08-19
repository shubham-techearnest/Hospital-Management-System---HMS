package com.health360.billing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.billing.presentation.dto.request.CreateInvoiceLineItemRequest;
import com.health360.billing.presentation.dto.request.CreateInvoiceRequest;
import com.health360.billing.presentation.dto.request.RecordPaymentRequest;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
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

import java.math.BigDecimal;
import java.util.List;
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
class BillingIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID PATIENT_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private static final UUID DOCTOR_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000063");
    private static final String HOSPITAL_ADMIN_EMAIL = "hospital.admin@health360.test";
    private static final String DOCTOR_EMAIL = "siddharth.deshmukh@health360.test";
    private static final String PATIENT_EMAIL = "shubham@gmail.com";
    private static final String PATIENT_PASSWORD = "Kadam@123";

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
    void hospitalAdminCreatesInvoiceAndRecordsPaymentPatientSeesIt() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);
        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);
        String patientToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, PATIENT_EMAIL, PATIENT_PASSWORD);

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(PATIENT_PROFILE_ID);
        encounterRequest.setHospitalId(HOSPITAL_ID);
        encounterRequest.setBranchId(BRANCH_ID);
        encounterRequest.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        encounterRequest.setEncounterType("OPD");
        encounterRequest.setVisitReason("Billing flow test");

        MvcResult encounterResult = mockMvc.perform(post("/api/v1/clinical/encounters")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(encounterRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID encounterId = UUID.fromString(objectMapper.readTree(encounterResult.getResponse().getContentAsString())
                .path("data").path("encounterId").asText());

        CreateInvoiceLineItemRequest lineItem = new CreateInvoiceLineItemRequest();
        lineItem.setDescription("OPD consultation");
        lineItem.setQuantity(BigDecimal.ONE);
        lineItem.setUnitPrice(new BigDecimal("500.00"));
        lineItem.setSourceType("ENCOUNTER");

        CreateInvoiceRequest invoiceRequest = new CreateInvoiceRequest();
        invoiceRequest.setEncounterId(encounterId);
        invoiceRequest.setLineItems(List.of(lineItem));

        MvcResult invoiceResult = mockMvc.perform(post("/api/v1/billing/invoices")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invoiceRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ISSUED"))
                .andExpect(jsonPath("$.data.totalAmount").value(500.00))
                .andReturn();

        String invoiceId = objectMapper.readTree(invoiceResult.getResponse().getContentAsString())
                .path("data").path("invoiceId").asText();

        RecordPaymentRequest paymentRequest = new RecordPaymentRequest();
        paymentRequest.setAmount(new BigDecimal("500.00"));
        paymentRequest.setPaymentMethod("CASH");

        mockMvc.perform(post("/api/v1/billing/invoices/" + invoiceId + "/payments")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("CAPTURED"));

        mockMvc.perform(get("/api/v1/billing/invoices/" + invoiceId)
                        .header("Authorization", IntegrationTestAuth.bearer(patientToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAID"));

        mockMvc.perform(get("/api/v1/billing/invoices/me")
                        .header("Authorization", IntegrationTestAuth.bearer(patientToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }
}
