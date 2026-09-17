package com.health360.adt.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.icu.application.service.IcuStayService;
import com.health360.icu.presentation.dto.request.CreateIcuStayRequest;
import com.health360.icu.presentation.dto.request.DischargeIcuStayRequest;
import com.health360.icu.presentation.dto.response.IcuDischargeResponse;
import com.health360.icu.presentation.dto.response.IcuStayResponse;
import com.health360.ipd.application.service.IpdAdmissionService;
import com.health360.ipd.presentation.dto.request.CreateIpdAdmissionRequest;
import com.health360.ipd.presentation.dto.request.DischargeIpdPatientRequest;
import com.health360.ipd.presentation.dto.request.TransferIpdBedRequest;
import com.health360.ipd.presentation.dto.response.IpdAdmissionResponse;
import com.health360.ipd.presentation.dto.response.IpdDischargeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Thin ADT facade over existing IPD/ICU bed lifecycle.
 * Does not introduce separate bed tables — beds remain in {@code ipd.*} / ICU unit beds.
 */
@Service
@RequiredArgsConstructor
public class AdtFacade {

    private final IpdAdmissionService ipdAdmissionService;
    private final IcuStayService icuStayService;

    @Transactional
    public IpdAdmissionResponse admit(UserPrincipal principal, CreateIpdAdmissionRequest request) {
        return ipdAdmissionService.admitPatient(principal, request);
    }

    @Transactional
    public IpdAdmissionResponse transfer(UserPrincipal principal, UUID admissionId, TransferIpdBedRequest request) {
        return ipdAdmissionService.transferBed(principal, admissionId, request);
    }

    @Transactional
    public IpdDischargeResponse discharge(
            UserPrincipal principal, UUID admissionId, DischargeIpdPatientRequest request) {
        return ipdAdmissionService.dischargePatient(principal, admissionId, request);
    }

    @Transactional
    public IcuStayResponse admitIcu(UserPrincipal principal, CreateIcuStayRequest request) {
        return icuStayService.admitToIcu(principal, request);
    }

    @Transactional
    public IcuDischargeResponse dischargeIcu(
            UserPrincipal principal, UUID stayId, DischargeIcuStayRequest request) {
        return icuStayService.dischargeFromIcu(principal, stayId, request);
    }
}
