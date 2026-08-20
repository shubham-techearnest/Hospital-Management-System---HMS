package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.HospitalRegistrationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HospitalRegistrationRepository extends JpaRepository<HospitalRegistrationEntity, UUID> {

    Optional<HospitalRegistrationEntity> findByPatientIdAndHospitalIdAndBranchIdAndDeletedAtIsNull(
            UUID patientId, UUID hospitalId, UUID branchId);

    Optional<HospitalRegistrationEntity> findByPatientIdAndHospitalIdAndBranchIdIsNullAndDeletedAtIsNull(
            UUID patientId, UUID hospitalId);
}
