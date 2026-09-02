package com.health360.patient.application.service;

import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.infrastructure.persistence.repository.UserRepository;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientDisplayNameResolver {

    private final UserRepository userRepository;

    public String resolve(PatientProfileEntity profile) {
        if (profile == null) {
            return null;
        }
        String legalName = buildName(profile.getLegalFirstName(), profile.getLegalLastName());
        if (legalName != null) {
            return legalName;
        }
        if (profile.getUserId() != null) {
            return userRepository.findById(profile.getUserId())
                    .map(this::userDisplayName)
                    .orElse(null);
        }
        return null;
    }

    public Map<UUID, String> resolveBatch(Collection<PatientProfileEntity> profiles) {
        if (profiles == null || profiles.isEmpty()) {
            return Map.of();
        }

        Map<UUID, UUID> profileUserIds = profiles.stream()
                .filter(p -> p.getUserId() != null)
                .collect(Collectors.toMap(PatientProfileEntity::getId, PatientProfileEntity::getUserId, (a, b) -> a));

        Map<UUID, UserEntity> usersById = userRepository.findAllById(profileUserIds.values()).stream()
                .collect(Collectors.toMap(UserEntity::getId, Function.identity()));

        Map<UUID, String> names = new HashMap<>();
        for (PatientProfileEntity profile : profiles) {
            String legalName = buildName(profile.getLegalFirstName(), profile.getLegalLastName());
            if (legalName != null) {
                names.put(profile.getId(), legalName);
                continue;
            }
            UserEntity user = usersById.get(profile.getUserId());
            String userName = userDisplayName(user);
            if (userName != null) {
                names.put(profile.getId(), userName);
            }
        }
        return names;
    }

    private String userDisplayName(UserEntity user) {
        if (user == null) {
            return null;
        }
        return buildName(user.getFirstName(), user.getLastName());
    }

    private String buildName(String firstName, String lastName) {
        String name = ((firstName == null ? "" : firstName.trim()) + " "
                + (lastName == null ? "" : lastName.trim())).trim();
        return name.isBlank() ? null : name;
    }
}
