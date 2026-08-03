package com.health360.hospital.application.service;

import com.health360.hospital.infrastructure.persistence.entity.*;
import com.health360.hospital.presentation.dto.response.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class HospitalMapper {

    public HospitalProfileResponse toProfileResponse(
            HospitalEntity entity, int branchCount, int departmentCount, int doctorCount) {
        return HospitalProfileResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .registrationNumber(entity.getRegistrationNumber())
                .hospitalType(entity.getHospitalType())
                .establishedYear(entity.getEstablishedYear())
                .totalBedCount(entity.getTotalBedCount())
                .accreditation(entity.getAccreditation())
                .description(entity.getDescription())
                .emergencyInfo(HospitalProfileResponse.EmergencyInfo.builder()
                        .emergencyAvailable24x7(entity.isEmergencyAvailable24x7())
                        .emergencyPhone(entity.getEmergencyPhone())
                        .ambulanceAvailable(entity.isAmbulanceAvailable())
                        .icuAvailable(entity.isIcuAvailable())
                        .icuBedCount(entity.getIcuBedCount())
                        .icuType(entity.getIcuType())
                        .build())
                .branchCount(branchCount)
                .departmentCount(departmentCount)
                .doctorCount(doctorCount)
                .build();
    }

    public BranchResponse toBranchResponse(BranchEntity entity, List<BranchWorkingHoursEntity> hours) {
        return BranchResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .addressLine1(entity.getAddressLine1())
                .addressLine2(entity.getAddressLine2())
                .city(entity.getCity())
                .state(entity.getState())
                .pincode(entity.getPincode())
                .country(entity.getCountry())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .primary(entity.isPrimary())
                .workingHours(hours.stream().map(this::toWorkingHoursResponse).toList())
                .build();
    }

    public BranchResponse.WorkingHoursResponse toWorkingHoursResponse(BranchWorkingHoursEntity h) {
        return BranchResponse.WorkingHoursResponse.builder()
                .dayOfWeek(h.getDayOfWeek())
                .openTime(h.getOpenTime().toString())
                .closeTime(h.getCloseTime().toString())
                .closed(h.isClosed())
                .build();
    }

    public DepartmentResponse toDepartmentResponse(DepartmentEntity entity) {
        return DepartmentResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .floor(entity.getFloor())
                .headDoctorId(entity.getHeadDoctorId())
                .active(entity.isActive())
                .build();
    }

    public FacilityResponse toFacilityResponse(FacilityEntity entity) {
        return FacilityResponse.builder()
                .id(entity.getId())
                .branchId(entity.getBranchId())
                .name(entity.getName())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .available(entity.isAvailable())
                .build();
    }
}
