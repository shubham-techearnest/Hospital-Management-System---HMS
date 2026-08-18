package com.health360.ipd.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.ipd.domain.BedStatus;
import com.health360.ipd.infrastructure.persistence.entity.*;
import com.health360.ipd.infrastructure.persistence.repository.*;
import com.health360.ipd.presentation.dto.request.CreateIpdBedRequest;
import com.health360.ipd.presentation.dto.request.CreateIpdRoomRequest;
import com.health360.ipd.presentation.dto.request.CreateIpdWardRequest;
import com.health360.ipd.presentation.dto.response.IpdBedResponse;
import com.health360.ipd.presentation.dto.response.IpdRoomResponse;
import com.health360.ipd.presentation.dto.response.IpdWardResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IpdFacilityService {

    private final IpdWardRepository wardRepository;
    private final IpdRoomRepository roomRepository;
    private final IpdBedRepository bedRepository;
    private final IpdAccessService accessService;
    private final IpdMapper mapper;
    private final AuditLogService auditLogService;

    @Transactional
    public IpdWardResponse createWard(UserPrincipal principal, CreateIpdWardRequest request) {
        accessService.assertCanManageWards(principal);
        accessService.assertHospitalScope(principal, request.getHospitalId());

        if (wardRepository.existsByHospitalIdAndBranchIdAndCodeAndDeletedAtIsNull(
                request.getHospitalId(), request.getBranchId(), request.getCode().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Ward code already exists for this branch");
        }

        IpdWardEntity ward = new IpdWardEntity();
        ward.setTenantId(principal.getTenantId());
        ward.setHospitalId(request.getHospitalId());
        ward.setBranchId(request.getBranchId());
        ward.setDepartmentId(request.getDepartmentId());
        ward.setName(request.getName().trim());
        ward.setCode(request.getCode().trim().toUpperCase());
        ward.setWardType(request.getWardType() != null ? request.getWardType().trim().toUpperCase() : "GENERAL");
        ward.setCreatedBy(principal.getUserId());
        ward.setUpdatedBy(principal.getUserId());

        IpdWardEntity saved = wardRepository.save(ward);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_WARD_CREATED",
                "IpdWard", saved.getId(), Map.of("code", saved.getCode()));
        return mapper.toWardResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<IpdWardResponse> listWards(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        accessService.assertCanReadWards(principal);
        accessService.assertHospitalScope(principal, hospitalId);
        return wardRepository
                .findByTenantIdAndHospitalIdAndBranchIdAndDeletedAtIsNullOrderByNameAsc(
                        principal.getTenantId(), hospitalId, branchId)
                .stream()
                .map(mapper::toWardResponse)
                .toList();
    }

    @Transactional
    public IpdRoomResponse createRoom(UserPrincipal principal, CreateIpdRoomRequest request) {
        accessService.assertCanManageWards(principal);
        IpdWardEntity ward = requireWard(principal.getTenantId(), request.getWardId());
        accessService.assertWardScope(principal, ward);

        if (roomRepository.existsByWardIdAndCodeAndDeletedAtIsNull(ward.getId(), request.getCode().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Room code already exists in this ward");
        }

        IpdRoomEntity room = new IpdRoomEntity();
        room.setTenantId(principal.getTenantId());
        room.setWardId(ward.getId());
        room.setName(request.getName().trim());
        room.setCode(request.getCode().trim().toUpperCase());
        room.setCreatedBy(principal.getUserId());
        room.setUpdatedBy(principal.getUserId());

        return mapper.toRoomResponse(roomRepository.save(room));
    }

    @Transactional(readOnly = true)
    public List<IpdRoomResponse> listRooms(UserPrincipal principal, UUID wardId) {
        accessService.assertCanReadWards(principal);
        IpdWardEntity ward = requireWard(principal.getTenantId(), wardId);
        accessService.assertWardScope(principal, ward);
        return roomRepository.findByTenantIdAndWardIdAndDeletedAtIsNullOrderByCodeAsc(
                        principal.getTenantId(), wardId)
                .stream()
                .map(mapper::toRoomResponse)
                .toList();
    }

    @Transactional
    public IpdBedResponse createBed(UserPrincipal principal, CreateIpdBedRequest request) {
        accessService.assertCanManageBeds(principal);
        IpdRoomEntity room = requireRoom(principal.getTenantId(), request.getRoomId());
        IpdWardEntity ward = requireWard(principal.getTenantId(), room.getWardId());
        accessService.assertWardScope(principal, ward);

        if (bedRepository.existsByRoomIdAndBedNumberAndDeletedAtIsNull(
                room.getId(), request.getBedNumber().trim())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Bed number already exists in this room");
        }

        IpdBedEntity bed = new IpdBedEntity();
        bed.setTenantId(principal.getTenantId());
        bed.setRoomId(room.getId());
        bed.setBedNumber(request.getBedNumber().trim());
        bed.setStatus(BedStatus.AVAILABLE.name());
        bed.setCreatedBy(principal.getUserId());
        bed.setUpdatedBy(principal.getUserId());

        IpdBedEntity saved = bedRepository.save(bed);
        return mapper.toBedResponse(saved, room, ward);
    }

    @Transactional(readOnly = true)
    public List<IpdBedResponse> listBeds(
            UserPrincipal principal, UUID hospitalId, UUID branchId, String status) {
        accessService.assertCanReadBeds(principal);
        accessService.assertHospitalScope(principal, hospitalId);

        String normalizedStatus = status != null && !status.isBlank() ? status.trim().toUpperCase() : null;
        return bedRepository.findByHospitalBranch(
                        principal.getTenantId(), hospitalId, branchId, normalizedStatus)
                .stream()
                .map(bed -> {
                    IpdRoomEntity room = requireRoom(principal.getTenantId(), bed.getRoomId());
                    IpdWardEntity ward = requireWard(principal.getTenantId(), room.getWardId());
                    return mapper.toBedResponse(bed, room, ward);
                })
                .toList();
    }

    IpdWardEntity requireWard(UUID tenantId, UUID wardId) {
        return wardRepository.findByIdAndTenantIdAndDeletedAtIsNull(wardId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Ward not found"));
    }

    IpdRoomEntity requireRoom(UUID tenantId, UUID roomId) {
        return roomRepository.findByIdAndTenantIdAndDeletedAtIsNull(roomId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Room not found"));
    }

    IpdBedEntity requireBed(UUID tenantId, UUID bedId) {
        return bedRepository.findByIdAndTenantIdAndDeletedAtIsNull(bedId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Bed not found"));
    }

    IpdBedEntity requireAvailableBed(UUID tenantId, UUID bedId) {
        IpdBedEntity bed = bedRepository.findByIdAndTenantIdAndDeletedAtIsNull(bedId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Bed not found"));
        if (!BedStatus.AVAILABLE.name().equals(bed.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Bed is not available");
        }
        return bed;
    }

    void occupyBed(IpdBedEntity bed, UUID userId) {
        bed.setStatus(BedStatus.OCCUPIED.name());
        bed.setUpdatedBy(userId);
        bedRepository.save(bed);
    }

    void releaseBed(IpdBedEntity bed, UUID userId) {
        bed.setStatus(BedStatus.AVAILABLE.name());
        bed.setUpdatedBy(userId);
        bedRepository.save(bed);
    }
}
