package com.health360.opd;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.billing.presentation.dto.request.CreateInvoiceLineItemRequest;
import com.health360.billing.presentation.dto.request.CreateInvoiceRequest;
import com.health360.billing.presentation.dto.request.RecordPaymentRequest;
import com.health360.clinical.presentation.dto.request.CreateClinicalNoteRequest;
import com.health360.clinical.presentation.dto.request.RecordClinicalVitalsRequest;
import com.health360.hospital.presentation.dto.request.InviteStaffRequest;
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

import java.math.BigDecimal;
import java.time.Instant;
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
class OpdWalkInGoldenPathIntegrationTest {

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
    void walkInThroughVitalsConsultCheckoutAndInvoice() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);
        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        String receptionistEmail = "receptionist.golden." + System.currentTimeMillis() + "@health360.test";
        InviteStaffRequest inviteRequest = new InviteStaffRequest();
        inviteRequest.setEmail(receptionistEmail);
        inviteRequest.setFirstName("Golden");
        inviteRequest.setLastName("Reception");
        inviteRequest.setTemporaryPassword("SecureP@ss1!");
        inviteRequest.setHospitalId(HOSPITAL_ID);
        inviteRequest.setRoleName("RECEPTIONIST");
        inviteRequest.setJobTitle("Front desk");

        mockMvc.perform(post("/api/v1/hospital/staff/invite")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inviteRequest)))
                .andExpect(status().isCreated());

        String receptionistToken = IntegrationTestAuth.loginAndGetAccessToken(
                mockMvc, objectMapper, receptionistEmail, "SecureP@ss1!");

        mockMvc.perform(get("/api/v1/hospital/staff/me/scope")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].hospitalId").value(HOSPITAL_ID.toString()));

        WalkInRegistrationRequest walkInRequest = new WalkInRegistrationRequest();
        walkInRequest.setPatientId(PATIENT_PROFILE_ID);
        walkInRequest.setHospitalId(HOSPITAL_ID);
        walkInRequest.setBranchId(BRANCH_ID);
        walkInRequest.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        walkInRequest.setVisitReason("Golden path walk-in");

        MvcResult registrationResult = mockMvc.perform(post("/api/v1/opd/registrations/walk-in")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(walkInRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.encounter.status").value("WAITING"))
                .andReturn();

        JsonNode registration = objectMapper.readTree(registrationResult.getResponse().getContentAsString())
                .path("data");
        String encounterId = registration.path("encounter").path("encounterId").asText();

        RecordClinicalVitalsRequest vitals = new RecordClinicalVitalsRequest();
        vitals.setSystolicBp(118);
        vitals.setDiastolicBp(76);
        vitals.setHeartRate(74);
        vitals.setRecordedAt(Instant.now());

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/vitals")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vitals)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/start")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk());

        prepareCheckoutClinical(encounterId, doctorToken);

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/complete")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        mockMvc.perform(get("/api/v1/clinical/encounters/" + encounterId + "/notes")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.status == 'FINAL')]").exists());

        mockMvc.perform(get("/api/v1/clinical/encounters/" + encounterId + "/prescriptions")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.status == 'SIGNED')]").exists());

        MvcResult invoiceResult = mockMvc.perform(post("/api/v1/billing/invoices")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invoicePayload(UUID.fromString(encounterId)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ISSUED"))
                .andReturn();

        String invoiceId = objectMapper.readTree(invoiceResult.getResponse().getContentAsString())
                .path("data").path("invoiceId").asText();

        RecordPaymentRequest paymentRequest = new RecordPaymentRequest();
        paymentRequest.setAmount(new BigDecimal("500.00"));
        paymentRequest.setPaymentMethod("CASH");

        mockMvc.perform(post("/api/v1/billing/invoices/" + invoiceId + "/payments")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("CAPTURED"));

        mockMvc.perform(get("/api/v1/billing/encounters/" + encounterId + "/invoice")
                        .header("Authorization", IntegrationTestAuth.bearer(receptionistToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAID"));
    }

    private void prepareCheckoutClinical(String encounterId, String doctorToken) throws Exception {
        CreateClinicalNoteRequest noteRequest = new CreateClinicalNoteRequest();
        noteRequest.setChiefComplaint("Fever");
        noteRequest.setAssessment("Viral illness");
        noteRequest.setPlan("Rest and fluids");

        MvcResult noteResult = mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/notes")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String noteId = objectMapper.readTree(noteResult.getResponse().getContentAsString())
                .path("data").path("noteId").asText();

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/notes/" + noteId + "/finalize")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/prescriptions/declare-no-medication")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SIGNED"));
    }

    private CreateInvoiceRequest invoicePayload(UUID encounterId) {
        CreateInvoiceLineItemRequest lineItem = new CreateInvoiceLineItemRequest();
        lineItem.setDescription("OPD consultation");
        lineItem.setQuantity(BigDecimal.ONE);
        lineItem.setUnitPrice(new BigDecimal("500.00"));
        lineItem.setSourceType("ENCOUNTER");

        CreateInvoiceRequest invoiceRequest = new CreateInvoiceRequest();
        invoiceRequest.setEncounterId(encounterId);
        invoiceRequest.setLineItems(java.util.List.of(lineItem));
        return invoiceRequest;
    }
}
