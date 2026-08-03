package com.health360.patient.infrastructure.persistence.repository;

import com.health360.patient.infrastructure.persistence.entity.FamilyMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FamilyMemberRepository extends JpaRepository<FamilyMemberEntity, UUID> {

    List<FamilyMemberEntity> findByPatientIdAndDeletedAtIsNullOrderByName(UUID patientId);

    Optional<FamilyMemberEntity> findByIdAndPatientIdAndDeletedAtIsNull(UUID id, UUID patientId);

    long countByPatientIdAndDeletedAtIsNull(UUID patientId);
}
