package com.health360.scheduling.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.opd.application.service.OpdRegistrationService;
import com.health360.opd.presentation.dto.request.CheckInAppointmentRequest;
import com.health360.scheduling.presentation.dto.request.ArriveAppointmentRequest;
import com.health360.scheduling.presentation.dto.response.AppointmentArrivalResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * P2-F1 — Canonical appointment arrival entry point (ADR-015).
 * Delegates encounter + queue creation to {@link OpdRegistrationService}.
 */
@Service
@RequiredArgsConstructor
public class AppointmentArrivalService {

    private final OpdRegistrationService opdRegistrationService;

    @Transactional
    public AppointmentArrivalResponse arrive(
            UserPrincipal principal,
            UUID appointmentId,
            ArriveAppointmentRequest request) {

        if (!principal.hasPermission("scheduling:appointment:arrive")
                && !principal.hasPermission("opd:registration:write")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }

        CheckInAppointmentRequest checkIn = new CheckInAppointmentRequest();
        checkIn.setAppointmentId(appointmentId);
        if (request != null) {
            checkIn.setDeskId(request.getDeskId());
            checkIn.setPriority(request.getPriority());
        }

        return opdRegistrationService.arriveAppointment(principal, checkIn);
    }
}
