package com.health360.config.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Getter
public class UserPrincipal implements UserDetails {

    private final UUID userId;
    private final UUID tenantId;
    private final String email;
    private final String jti;
    private final List<String> roles;
    private final List<String> permissions;
    /** Present when this principal is an impersonated subject. */
    private final UUID actorUserId;
    private final UUID impersonationSessionId;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID userId, UUID tenantId, String email, String jti,
                         List<String> roles, List<String> permissions) {
        this(userId, tenantId, email, jti, roles, permissions, null, null);
    }

    public UserPrincipal(UUID userId, UUID tenantId, String email, String jti,
                         List<String> roles, List<String> permissions,
                         UUID actorUserId, UUID impersonationSessionId) {
        this.userId = userId;
        this.tenantId = tenantId;
        this.email = email;
        this.jti = jti;
        this.roles = roles != null ? List.copyOf(roles) : List.of();
        this.permissions = permissions != null ? List.copyOf(permissions) : List.of();
        this.actorUserId = actorUserId;
        this.impersonationSessionId = impersonationSessionId;
        this.authorities = Stream.concat(
                this.roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)),
                this.permissions.stream().map(SimpleGrantedAuthority::new)
        ).toList();
    }

    public boolean isImpersonating() {
        return impersonationSessionId != null && actorUserId != null;
    }

    public boolean hasPermission(String permission) {
        return permissions.contains(permission);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return email != null ? email : "";
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
