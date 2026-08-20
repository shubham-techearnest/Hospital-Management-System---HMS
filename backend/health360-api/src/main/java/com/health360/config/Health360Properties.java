package com.health360.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.UUID;

@ConfigurationProperties(prefix = "health360")
@Getter
@Setter
public class Health360Properties {

    private UUID defaultTenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private String defaultTenantSlug = "default";
    private String appBaseUrl = "http://localhost:5173";
    /** Extra browser origins besides app-base-url. Comma-separated. */
    private String corsAllowedOrigins = "";
    private Jwt jwt = new Jwt();
    private Auth auth = new Auth();
    private Storage storage = new Storage();

    @Getter
    @Setter
    public static class Storage {
        /** Local filesystem base path for uploaded documents (dev/MVP). */
        private String localBasePath = ".local/uploads";
        private long maxFileSizeBytes = 5 * 1024 * 1024;
    }

    @Getter
    @Setter
    public static class Jwt {
        private String issuer = "health360.ai";
        private String audience = "health360-api";
        private long accessTokenTtlSeconds = 900;
        private long refreshTokenTtlSeconds = 604800;
        /** Base64-encoded PKCS#8 RSA private key (optional; local dev persists keys to .local/) */
        private String privateKey;
        /** Base64-encoded X.509 RSA public key (optional) */
        private String publicKey;
    }

    @Getter
    @Setter
    public static class Auth {
        private int maxFailedLoginAttempts = 5;
        private long lockoutDurationMinutes = 30;
        private long emailVerificationTtlHours = 24;
    }
}
