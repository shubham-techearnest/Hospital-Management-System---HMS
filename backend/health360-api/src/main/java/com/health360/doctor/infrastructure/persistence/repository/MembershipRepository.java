package com.health360.doctor.infrastructure.persistence.repository;

import com.health360.doctor.infrastructure.persistence.entity.MembershipEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembershipRepository extends JpaRepository<MembershipEntity, UUID> {

    List<MembershipEntity> findByDoctorIdAndDeletedAtIsNullOrderByOrganizationAsc(UUID doctorId);

    Optional<MembershipEntity> findByIdAndDoctorIdAndDeletedAtIsNull(UUID id, UUID doctorId);
}
