package com.health360.doctor.application.service;

import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorDisplayNameResolver {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;

    public String resolve(UUID doctorId) {
        if (doctorId == null) {
            return null;
        }
        return doctorProfileRepository.findById(doctorId)
                .flatMap(doctor -> userRepository.findById(doctor.getUserId()))
                .map(user -> ((user.getFirstName() == null ? "" : user.getFirstName()) + " "
                        + (user.getLastName() == null ? "" : user.getLastName())).trim())
                .filter(name -> !name.isBlank())
                .orElse(null);
    }
}
