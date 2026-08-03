package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import com.health360.config.JwtKeyProvider;
import com.health360.iam.application.dto.TokenPair;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtTokenService {

    private final JwtKeyProvider keyProvider;
    private final Health360Properties properties;

    public TokenPair generateAccessToken(UUID userId, UUID tenantId, String email,
                                         List<String> roles, List<String> permissions) {
        Instant now = Instant.now();
        long ttl = properties.getJwt().getAccessTokenTtlSeconds();
        String jti = UUID.randomUUID().toString();

        String token = Jwts.builder()
                .header().keyId("health360-1").and()
                .issuer(properties.getJwt().getIssuer())
                .audience().add(properties.getJwt().getAudience()).and()
                .subject(userId.toString())
                .id(jti)
                .claim("tenantId", tenantId.toString())
                .claim("email", email)
                .claim("roles", roles)
                .claim("permissions", permissions)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttl)))
                .signWith(keyProvider.getKeyPair().getPrivate())
                .compact();

        return new TokenPair(token, jti, ttl);
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(keyProvider.getKeyPair().getPublic())
                .requireIssuer(properties.getJwt().getIssuer())
                .requireAudience(properties.getJwt().getAudience())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
