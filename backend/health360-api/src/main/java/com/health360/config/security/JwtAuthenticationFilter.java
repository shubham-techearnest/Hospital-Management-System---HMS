package com.health360.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.iam.application.service.JwtTokenService;
import com.health360.iam.application.service.TokenBlacklistService;
import com.health360.shared.domain.ErrorCode;import com.health360.shared.dto.ErrorResponse;
import com.health360.shared.filter.CorrelationIdFilter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtTokenService.parseToken(token);
                String jti = claims.getId();
                if (tokenBlacklistService.isBlacklisted(jti)) {
                    writeUnauthorized(response, "Access token has been revoked");
                    return;
                }

                UUID userId = UUID.fromString(claims.getSubject());
                UUID tenantId = UUID.fromString(claims.get("tenantId", String.class));
                String email = claims.get("email", String.class);
                List<String> roles = JwtClaimUtils.getStringList(claims, "roles");
                List<String> permissions = JwtClaimUtils.getStringList(claims, "permissions");

                UserPrincipal principal = new UserPrincipal(userId, tenantId, email, jti, roles, permissions);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (ExpiredJwtException ex) {
                log.debug("Expired JWT: {}", ex.getMessage());
                writeUnauthorized(response, "Access token has expired");
                return;
            } catch (RuntimeException ex) {
                log.warn("JWT authentication failed: {}", ex.getMessage());
                writeUnauthorized(response, "Invalid access token");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
        ErrorResponse body = ErrorResponse.of(
                ErrorCode.UNAUTHORIZED.name(),
                message,
                correlationId != null ? correlationId : "unknown");
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
