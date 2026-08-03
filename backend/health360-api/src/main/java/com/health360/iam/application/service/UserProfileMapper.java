package com.health360.iam.application.service;

import com.health360.iam.infrastructure.persistence.entity.UserEntity;
import com.health360.iam.presentation.dto.response.UserProfileResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserProfileMapper {

    public UserProfileResponse toResponse(UserEntity user, List<String> roles, List<String> permissions) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .roles(roles)
                .permissions(permissions)
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .timezone(user.getTimezone())
                .locale(user.getLocale())
                .build();
    }
}
