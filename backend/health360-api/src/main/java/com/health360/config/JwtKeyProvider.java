package com.health360.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Getter
@Slf4j
public class JwtKeyProvider {

    private static final Path DEFAULT_KEY_FILE = Path.of(".local", "jwt-dev-keys.properties");

    private final Health360Properties properties;
    private KeyPair keyPair;

    @PostConstruct
    void init() {
        if (hasConfiguredKeys()) {
            keyPair = loadFromConfiguration();
            log.info("Loaded JWT key pair from application configuration");
            return;
        }

        for (Path path : keyFileCandidates()) {
            if (Files.isRegularFile(path)) {
                keyPair = loadFromFile(path);
                log.info("Loaded persisted JWT key pair from {}", path.toAbsolutePath());
                return;
            }
        }

        keyPair = generateKeyPair();
        for (Path path : keyFileCandidates()) {
            if (tryPersistKeyPair(path, keyPair)) {
                log.info("Generated and persisted JWT key pair to {}", path.toAbsolutePath());
                return;
            }
        }

        log.warn(
                "Using ephemeral in-memory JWT keys; tokens are invalidated on restart. "
                        + "Set JWT_PRIVATE_KEY/JWT_PUBLIC_KEY or ensure a writable key directory for production.");
    }

    private boolean hasConfiguredKeys() {
        Health360Properties.Jwt jwt = properties.getJwt();
        return jwt.getPrivateKey() != null && !jwt.getPrivateKey().isBlank()
                && jwt.getPublicKey() != null && !jwt.getPublicKey().isBlank();
    }

    private KeyPair loadFromConfiguration() {
        try {
            Health360Properties.Jwt jwt = properties.getJwt();
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PrivateKey privateKey = keyFactory.generatePrivate(
                    new PKCS8EncodedKeySpec(decodeKeyMaterial(jwt.getPrivateKey())));
            PublicKey publicKey = keyFactory.generatePublic(
                    new X509EncodedKeySpec(decodeKeyMaterial(jwt.getPublicKey())));
            return new KeyPair(publicKey, privateKey);
        } catch (Exception ex) {
            throw new IllegalStateException("Invalid JWT keys in configuration", ex);
        }
    }

    private KeyPair loadFromFile(Path path) {
        try {
            Properties props = new Properties();
            try (InputStream input = Files.newInputStream(path)) {
                props.load(input);
            }
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PrivateKey privateKey = keyFactory.generatePrivate(
                    new PKCS8EncodedKeySpec(decodeKeyMaterial(props.getProperty("privateKey"))));
            PublicKey publicKey = keyFactory.generatePublic(
                    new X509EncodedKeySpec(decodeKeyMaterial(props.getProperty("publicKey"))));
            return new KeyPair(publicKey, privateKey);
        } catch (Exception ex) {
            throw new IllegalStateException("Invalid JWT key file at " + path.toAbsolutePath(), ex);
        }
    }

    private boolean tryPersistKeyPair(Path path, KeyPair pair) {
        try {
            persistKeyPair(path, pair);
            return true;
        } catch (IOException ex) {
            log.debug("Could not persist JWT keys to {}: {}", path.toAbsolutePath(), ex.getMessage());
            return false;
        }
    }

    private void persistKeyPair(Path path, KeyPair pair) throws IOException {
        Files.createDirectories(path.getParent());
        Properties props = new Properties();
        props.setProperty("privateKey", Base64.getEncoder().encodeToString(pair.getPrivate().getEncoded()));
        props.setProperty("publicKey", Base64.getEncoder().encodeToString(pair.getPublic().getEncoded()));
        try (OutputStream output = Files.newOutputStream(path)) {
            props.store(output, "Health360 local JWT signing keys. Do not commit.");
        }
    }

    private KeyPair generateKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("RSA key generation unavailable", ex);
        }
    }

    private List<Path> keyFileCandidates() {
        Set<Path> paths = new LinkedHashSet<>();
        paths.add(DEFAULT_KEY_FILE);
        String home = System.getProperty("user.home");
        if (home != null && !home.isBlank()) {
            paths.add(Path.of(home, ".health360", "jwt-dev-keys.properties"));
        }
        paths.add(Path.of("/tmp", "health360", "jwt-dev-keys.properties"));
        return new ArrayList<>(paths);
    }

    private static byte[] decodeKeyMaterial(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("JWT key material is blank");
        }
        String normalized = value
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        try {
            return Base64.getDecoder().decode(normalized);
        } catch (IllegalArgumentException ex) {
            throw new UncheckedIOException(new IOException("JWT key is not valid Base64", ex));
        }
    }
}
