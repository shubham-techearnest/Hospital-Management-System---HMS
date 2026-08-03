package com.health360.iam.application.dto;

public record TokenPair(String accessToken, String jti, long expiresInSeconds) {
}
