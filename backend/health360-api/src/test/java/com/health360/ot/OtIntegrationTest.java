package com.health360.ot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.clinical.presentation.dto.request.CreateClinicalOrderRequest;
import com.health360.clinical.presentation.dto.request.CreateEncounterRequest;
import com.health360.ot.presentation.dto.request.*;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
class OtIntegrationTest {

    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID PATIENT_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000070");
    private static final UUID DOCTOR_PROFILE_ID = UUID.fromString("00000000-0000-0000-0000-000000000063");
    private static final UUID DOCTOR_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000053");
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
    void theatreScheduleTeamNotesAndCompleteFlow() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);
        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        CreateOperationTheatreRequest theatreRequest = new CreateOperationTheatreRequest();
        theatreRequest.setHospitalId(HOSPITAL_ID);
        theatreRequest.setBranchId(BRANCH_ID);
        theatreRequest.setName("Main OT");
        theatreRequest.setCode("OT-1");

        MvcResult theatreResult = mockMvc.perform(post("/api/v1/ot/theatres")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(theatreRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("OT-1"))
                .andReturn();

        String theatreId = objectMapper.readTree(theatreResult.getResponse().getContentAsString())
                .path("data").path("theatreId").asText();

        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(PATIENT_PROFILE_ID);
        encounterRequest.setHospitalId(HOSPITAL_ID);
        encounterRequest.setBranchId(BRANCH_ID);
        encounterRequest.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        encounterRequest.setEncounterType("IPD");
        encounterRequest.setVisitReason("Scheduled surgery");

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
        orderRequest.setOrderType("PROCEDURE");
        orderRequest.setInstructions("NPO from midnight");

        CreateClinicalOrderRequest.OrderItemRequest item = new CreateClinicalOrderRequest.OrderItemRequest();
        item.setItemCode("APPEND");
        item.setItemName("Appendectomy");
        orderRequest.setItems(List.of(item));

        MvcResult orderResult = mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/orders")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String clinicalOrderItemId = objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data").path("items").get(0).path("itemId").asText();

        CreateOtProcedureRequest procedureRequest = new CreateOtProcedureRequest();
        procedureRequest.setClinicalOrderItemId(UUID.fromString(clinicalOrderItemId));

        MvcResult procedureResult = mockMvc.perform(post("/api/v1/ot/procedures")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(procedureRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("RECEIVED"))
                .andReturn();

        String procedureId = objectMapper.readTree(procedureResult.getResponse().getContentAsString())
                .path("data").path("procedureId").asText();

        Instant start = Instant.now().plus(1, ChronoUnit.HOURS).truncatedTo(ChronoUnit.SECONDS);
        Instant end = start.plus(2, ChronoUnit.HOURS);

        ScheduleOtProcedureRequest scheduleRequest = new ScheduleOtProcedureRequest();
        scheduleRequest.setTheatreId(UUID.fromString(theatreId));
        scheduleRequest.setScheduledStart(start);
        scheduleRequest.setScheduledEnd(end);
        scheduleRequest.setNotes("Patient cleared for surgery");

        mockMvc.perform(post("/api/v1/ot/procedures/" + procedureId + "/schedule")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scheduleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SCHEDULED"));

        AddOtTeamMemberRequest teamRequest = new AddOtTeamMemberRequest();
        teamRequest.setMemberRole("SURGEON");
        teamRequest.setUserId(DOCTOR_USER_ID);
        teamRequest.setMemberName("Dr Siddharth");

        mockMvc.perform(post("/api/v1/ot/procedures/" + procedureId + "/team")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(teamRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.memberRole").value("SURGEON"));

        AddOtNoteRequest intraNote = new AddOtNoteRequest();
        intraNote.setNoteType("INTRA_OP");
        intraNote.setContent("Laparoscopic appendectomy completed without complications");

        mockMvc.perform(post("/api/v1/ot/procedures/" + procedureId + "/start")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));

        mockMvc.perform(post("/api/v1/ot/procedures/" + procedureId + "/notes")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(intraNote)))
                .andExpect(status().isCreated());

        CompleteOtProcedureRequest completeRequest = new CompleteOtProcedureRequest();
        completeRequest.setSummaryText("Patient stable, transferred to recovery");

        mockMvc.perform(post("/api/v1/ot/procedures/" + procedureId + "/complete")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.teamMembers", hasSize(1)));

        mockMvc.perform(get("/api/v1/ot/encounters/" + encounterId + "/procedures")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].procedureName").value("Appendectomy"));
    }

    @Test
    void scheduleConflictIsRejected() throws Exception {
        String adminToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, HOSPITAL_ADMIN_EMAIL);
        String doctorToken = IntegrationTestAuth.loginAndGetAccessToken(mockMvc, objectMapper, DOCTOR_EMAIL);

        CreateOperationTheatreRequest theatreRequest = new CreateOperationTheatreRequest();
        theatreRequest.setHospitalId(HOSPITAL_ID);
        theatreRequest.setBranchId(BRANCH_ID);
        theatreRequest.setName("Conflict OT");
        theatreRequest.setCode("OT-C");

        MvcResult theatreResult = mockMvc.perform(post("/api/v1/ot/theatres")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(theatreRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String theatreId = objectMapper.readTree(theatreResult.getResponse().getContentAsString())
                .path("data").path("theatreId").asText();

        Instant start = Instant.parse("2030-06-01T09:00:00Z");
        Instant end = Instant.parse("2030-06-01T11:00:00Z");

        ScheduleOtProcedureRequest scheduleRequest = new ScheduleOtProcedureRequest();
        scheduleRequest.setTheatreId(UUID.fromString(theatreId));
        scheduleRequest.setScheduledStart(start);
        scheduleRequest.setScheduledEnd(end);

        String procedureId1 = createProcedureForOrder(adminToken, doctorToken, "Proc A");
        String procedureId2 = createProcedureForOrder(adminToken, doctorToken, "Proc B");

        mockMvc.perform(post("/api/v1/ot/procedures/" + procedureId1 + "/schedule")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scheduleRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/ot/procedures/" + procedureId2 + "/schedule")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scheduleRequest)))
                .andExpect(status().isConflict());
    }

    private String createProcedureForOrder(String adminToken, String doctorToken, String procedureName) throws Exception {
        CreateEncounterRequest encounterRequest = new CreateEncounterRequest();
        encounterRequest.setPatientId(PATIENT_PROFILE_ID);
        encounterRequest.setHospitalId(HOSPITAL_ID);
        encounterRequest.setBranchId(BRANCH_ID);
        encounterRequest.setPrimaryDoctorId(DOCTOR_PROFILE_ID);
        encounterRequest.setEncounterType("IPD");
        encounterRequest.setVisitReason("OT conflict test");

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
        orderRequest.setOrderType("PROCEDURE");
        CreateClinicalOrderRequest.OrderItemRequest item = new CreateClinicalOrderRequest.OrderItemRequest();
        item.setItemName(procedureName);
        orderRequest.setItems(List.of(item));

        MvcResult orderResult = mockMvc.perform(post("/api/v1/clinical/encounters/" + encounterId + "/orders")
                        .header("Authorization", IntegrationTestAuth.bearer(doctorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String clinicalOrderItemId = objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data").path("items").get(0).path("itemId").asText();

        CreateOtProcedureRequest procedureRequest = new CreateOtProcedureRequest();
        procedureRequest.setClinicalOrderItemId(UUID.fromString(clinicalOrderItemId));

        MvcResult procedureResult = mockMvc.perform(post("/api/v1/ot/procedures")
                        .header("Authorization", IntegrationTestAuth.bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(procedureRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(procedureResult.getResponse().getContentAsString())
                .path("data").path("procedureId").asText();
    }
}
