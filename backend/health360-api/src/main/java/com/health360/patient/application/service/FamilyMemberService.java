package com.health360.patient.application.service;

import com.health360.patient.infrastructure.persistence.entity.FamilyMemberEntity;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.FamilyMemberRepository;
import com.health360.patient.presentation.dto.request.FamilyMemberRequest;
import com.health360.patient.presentation.dto.response.FamilyMemberResponse;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FamilyMemberService {

    private final FamilyMemberRepository familyMemberRepository;
    private final PatientProfileService patientProfileService;

    @Transactional(readOnly = true)
    public List<FamilyMemberResponse> listFamilyMembers(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        return familyMemberRepository.findByPatientIdAndDeletedAtIsNullOrderByName(profile.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public FamilyMemberResponse createFamilyMember(UUID userId, UUID tenantId, FamilyMemberRequest request) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        FamilyMemberEntity entity = new FamilyMemberEntity();
        entity.setTenantId(tenantId);
        entity.setPatientId(profile.getId());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        apply(entity, request);
        familyMemberRepository.save(entity);
        patientProfileService.recalculateCompletionForProfile(profile);
        return toResponse(entity);
    }

    @Transactional
    public FamilyMemberResponse updateFamilyMember(
            UUID userId, UUID tenantId, UUID memberId, FamilyMemberRequest request) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        FamilyMemberEntity entity = requireMember(profile.getId(), memberId);
        apply(entity, request);
        entity.setUpdatedBy(userId);
        entity.touch();
        familyMemberRepository.save(entity);
        patientProfileService.recalculateCompletionForProfile(profile);
        return toResponse(entity);
    }

    @Transactional
    public void deleteFamilyMember(UUID userId, UUID tenantId, UUID memberId) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        FamilyMemberEntity entity = requireMember(profile.getId(), memberId);
        entity.setDeletedAt(Instant.now());
        entity.setUpdatedBy(userId);
        familyMemberRepository.save(entity);
        patientProfileService.recalculateCompletionForProfile(profile);
    }

    private FamilyMemberEntity requireMember(UUID patientId, UUID memberId) {
        return familyMemberRepository.findByIdAndPatientIdAndDeletedAtIsNull(memberId, patientId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Family member not found"));
    }

    private void apply(FamilyMemberEntity entity, FamilyMemberRequest request) {
        entity.setName(request.getName().trim());
        entity.setRelationship(request.getRelationship().trim());
        entity.setDateOfBirth(request.getDateOfBirth());
        entity.setGender(request.getGender() != null ? request.getGender().trim() : null);
        entity.setHereditaryConditions(request.getHereditaryConditions());
        if (request.getAlive() != null) {
            entity.setAlive(request.getAlive());
        }
    }

    private FamilyMemberResponse toResponse(FamilyMemberEntity entity) {
        return FamilyMemberResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .relationship(entity.getRelationship())
                .dateOfBirth(entity.getDateOfBirth())
                .gender(entity.getGender())
                .hereditaryConditions(entity.getHereditaryConditions())
                .alive(entity.isAlive())
                .build();
    }
}
