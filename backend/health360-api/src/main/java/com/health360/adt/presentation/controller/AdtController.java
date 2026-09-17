package com.health360.adt.presentation.controller;

import com.health360.adt.application.service.AdtFacade;
import com.health360.config.security.UserPrincipal;
import com.health360.icu.presentation.dto.request.CreateIcuStayRequest;
import com.health360.icu.presentation.dto.request.DischargeIcuStayRequest;
import com.health360.icu.presentation.dto.response.IcuDischargeResponse;
import com.health360.icu.presentation.dto.response.IcuStayResponse;
import com.health360.ipd.presentation.dto.request.CreateIpdAdmissionRequest;
import com.health360.ipd.presentation.dto.request.DischargeIpdPatientRequest;
import com.health360.ipd.presentation.dto.request.TransferIpdBedRequest;
import com.health360.ipd.presentation.dto.response.IpdAdmissionResponse;
import com.health360.ipd.presentation.dto.response.IpdDischargeResponse;
import com.health360.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * ADT facade HTTP surface — delegates to IPD/ICU; no separate bed store.
 */
@RestController
@RequestMapping("/api/v1/adt")
@RequiredArgsConstructor
public class AdtController {

    private final AdtFacade adtFacade;

    @PostMapping("/admit")
    @PreAuthorize("hasAuthority('adt:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> admit(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIpdAdmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(adtFacade.admit(principal, request)));
    }

    @PostMapping("/admissions/{admissionId}/transfer")
    @PreAuthorize("hasAuthority('adt:write')")
    public ResponseEntity<ApiResponse<IpdAdmissionResponse>> transfer(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody TransferIpdBedRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adtFacade.transfer(principal, admissionId, request)));
    }

    @PostMapping("/admissions/{admissionId}/discharge")
    @PreAuthorize("hasAuthority('adt:write')")
    public ResponseEntity<ApiResponse<IpdDischargeResponse>> discharge(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID admissionId,
            @Valid @RequestBody DischargeIpdPatientRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adtFacade.discharge(principal, admissionId, request)));
    }

    @PostMapping("/icu/admit")
    @PreAuthorize("hasAuthority('adt:write')")
    public ResponseEntity<ApiResponse<IcuStayResponse>> admitIcu(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateIcuStayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(adtFacade.admitIcu(principal, request)));
    }

    @PostMapping("/icu/stays/{stayId}/discharge")
    @PreAuthorize("hasAuthority('adt:write')")
    public ResponseEntity<ApiResponse<IcuDischargeResponse>> dischargeIcu(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID stayId,
            @Valid @RequestBody DischargeIcuStayRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adtFacade.dischargeIcu(principal, stayId, request)));
    }
}
