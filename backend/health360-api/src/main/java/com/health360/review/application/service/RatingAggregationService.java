package com.health360.review.application.service;

import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.hospital.infrastructure.persistence.entity.HospitalEntity;
import com.health360.hospital.infrastructure.persistence.repository.HospitalRepository;
import com.health360.review.infrastructure.persistence.repository.DoctorReviewRepository;
import com.health360.review.infrastructure.persistence.repository.HospitalReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RatingAggregationService {

    private final DoctorReviewRepository doctorReviewRepository;
    private final HospitalReviewRepository hospitalReviewRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final HospitalRepository hospitalRepository;

    @Transactional
    public void recalculateDoctorRating(UUID doctorId) {
        Object[] result = doctorReviewRepository.aggregateVisibleRatings(doctorId);
        applyDoctorRating(doctorId, result);
    }

    @Transactional
    public void recalculateHospitalRating(UUID hospitalId) {
        Object[] result = hospitalReviewRepository.aggregateVisibleRatings(hospitalId);
        applyHospitalRating(hospitalId, result);
    }

    private void applyDoctorRating(UUID doctorId, Object[] result) {
        DoctorProfileEntity doctor = doctorProfileRepository.findById(doctorId).orElse(null);
        if (doctor == null) {
            return;
        }
        long count = ((Number) result[1]).longValue();
        doctor.setReviewCount((int) count);
        if (count == 0) {
            doctor.setAverageRating(null);
        } else {
            double avg = ((Number) result[0]).doubleValue();
            doctor.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        }
        doctorProfileRepository.save(doctor);
    }

    private void applyHospitalRating(UUID hospitalId, Object[] result) {
        HospitalEntity hospital = hospitalRepository.findById(hospitalId).orElse(null);
        if (hospital == null) {
            return;
        }
        long count = ((Number) result[1]).longValue();
        hospital.setReviewCount((int) count);
        if (count == 0) {
            hospital.setAverageRating(null);
        } else {
            double avg = ((Number) result[0]).doubleValue();
            hospital.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        }
        hospitalRepository.save(hospital);
    }
}
