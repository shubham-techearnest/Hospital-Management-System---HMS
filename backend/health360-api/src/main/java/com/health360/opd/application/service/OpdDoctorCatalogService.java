package com.health360.opd.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.entity.HospitalAssociationEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.opd.presentation.dto.response.OpdDoctorOptionResponse;
import com.health360.shared.infrastructure.persistence.entity.SpecializationEntity;
import com.health360.shared.infrastructure.persistence.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OpdDoctorCatalogService {

    private final OpdAccessService opdAccessService;
    private final HospitalAssociationRepository associationRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;

    @Transactional(readOnly = true)
    public List<OpdDoctorOptionResponse> listDoctors(
            UserPrincipal principal, UUID hospitalId, UUID branchId) {
        opdAccessService.assertHospitalScope(principal, hospitalId);

        return associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(hospitalId).stream()
                .filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus()))
                .filter(a -> branchId == null
                        || a.getBranchId() == null
                        || a.getBranchId().equals(branchId))
                .map(this::toOption)
                .toList();
    }

    private OpdDoctorOptionResponse toOption(HospitalAssociationEntity assoc) {
        DoctorProfileEntity doctor = doctorProfileRepository.findById(assoc.getDoctorId()).orElse(null);
        String name = "Doctor";
        String specialization = null;
        if (doctor != null) {
            UserEntity user = userRepository.findById(doctor.getUserId()).orElse(null);
            if (user != null) {
                name = (user.getFirstName() + " " + user.getLastName()).trim();
            }
            if (doctor.getPrimarySpecializationId() != null) {
                specialization = specializationRepository.findById(doctor.getPrimarySpecializationId())
                        .map(SpecializationEntity::getName)
                        .orElse(null);
            }
        }
        return OpdDoctorOptionResponse.builder()
                .doctorId(assoc.getDoctorId())
                .doctorName(name)
                .specialization(specialization)
                .branchId(assoc.getBranchId())
                .status(assoc.getStatus())
                .build();
    }
}
