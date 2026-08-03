package com.health360.scheduling;

import com.health360.scheduling.application.service.AppointmentService;
import com.health360.scheduling.presentation.dto.request.BookAppointmentRequest;
import com.health360.shared.exception.BusinessException;
import com.health360.shared.domain.ErrorCode;
import com.health360.support.TestConditions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Testcontainers
@EnabledIf("com.health360.support.TestConditions#isDockerAvailable")
@ActiveProfiles("test")
class BookingConcurrencyIntegrationTest {

    private static final UUID TENANT_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID DOCTOR_ID = UUID.fromString("00000000-0000-0000-0000-000000000060");
    private static final UUID HOSPITAL_ID = UUID.fromString("00000000-0000-0000-0000-000000000030");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000031");
    private static final UUID PATIENT_USER_1 = UUID.fromString("00000000-0000-0000-0000-000000000054");
    private static final UUID PATIENT_USER_2 = UUID.fromString("00000000-0000-0000-0000-000000000055");
    private static final String PASSWORD_HASH =
            "$2a$12$t2j3c6vGKiRZuY4vub7GkeqXN4DrT11TjNB6McxulQoKiKkMEK7Wi";

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
    private AppointmentService appointmentService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void seedPatients() {
        insertPatient(PATIENT_USER_1, UUID.fromString("00000000-0000-0000-0000-000000000064"), "patient.one@health360.test");
        insertPatient(PATIENT_USER_2, UUID.fromString("00000000-0000-0000-0000-000000000065"), "patient.two@health360.test");
    }

    @Test
    void concurrentBooking_allowsOnlyOneSuccess() throws InterruptedException {
        UUID slotId = jdbcTemplate.queryForObject(
                """
                SELECT id
                FROM scheduling.time_slots
                WHERE doctor_id = ?
                  AND hospital_id = ?
                  AND branch_id = ?
                  AND status = 'AVAILABLE'
                  AND deleted_at IS NULL
                ORDER BY slot_date, start_time
                LIMIT 1
                """,
                UUID.class,
                DOCTOR_ID,
                HOSPITAL_ID,
                BRANCH_ID);
        assertNotNull(slotId);

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger successes = new AtomicInteger();
        AtomicInteger slotConflicts = new AtomicInteger();

        Runnable firstAttempt = bookingAttempt(PATIENT_USER_1, slotId, ready, start, successes, slotConflicts);
        Runnable secondAttempt = bookingAttempt(PATIENT_USER_2, slotId, ready, start, successes, slotConflicts);
        Thread first = new Thread(firstAttempt);
        Thread second = new Thread(secondAttempt);
        first.start();
        second.start();
        ready.await();
        start.countDown();
        first.join();
        second.join();

        assertEquals(1, successes.get(), "Exactly one booking should succeed");
        assertEquals(1, slotConflicts.get(), "Exactly one booking should fail with SLOT_UNAVAILABLE");

        Map<String, Object> slot = jdbcTemplate.queryForMap(
                "SELECT status, appointment_id FROM scheduling.time_slots WHERE id = ?",
                slotId);
        assertEquals("BOOKED", slot.get("status"));
        assertNotNull(slot.get("appointment_id"));
    }

    private Runnable bookingAttempt(
            UUID patientUserId,
            UUID slotId,
            CountDownLatch ready,
            CountDownLatch start,
            AtomicInteger successes,
            AtomicInteger slotConflicts) {
        return () -> {
            ready.countDown();
            try {
                start.await();
                BookAppointmentRequest request = new BookAppointmentRequest();
                request.setDoctorId(DOCTOR_ID);
                request.setHospitalId(HOSPITAL_ID);
                request.setBranchId(BRANCH_ID);
                request.setSlotId(slotId);
                request.setConsultationType("IN_PERSON");
                appointmentService.bookAppointment(patientUserId, TENANT_ID, request);
                successes.incrementAndGet();
            } catch (BusinessException ex) {
                if (ErrorCode.SLOT_UNAVAILABLE.equals(ex.getCode())) {
                    slotConflicts.incrementAndGet();
                } else {
                    throw ex;
                }
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new RuntimeException(ex);
            }
        };
    }

    private void insertPatient(UUID userId, UUID profileId, String email) {
        jdbcTemplate.update(
                """
                INSERT INTO iam.users (
                    id, tenant_id, email, password_hash,
                    first_name, last_name, phone,
                    status, email_verified, email_verified_at
                )
                VALUES (?, ?, ?, ?, 'Patient', 'Test', '9876500200', 'ACTIVE', TRUE, NOW())
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
