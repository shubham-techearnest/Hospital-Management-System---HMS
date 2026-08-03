package com.health360.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
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
import java.util.Base64;
import java.util.Properties;

@Component
@RequiredArgsConstructor
@Getter
@Slf4j
public class JwtKeyProvider {

    private static final Path KEY_FILE = Path.of(".local", "jwt-dev-keys.properties");

    private final Health360Properties properties;
    private KeyPair keyPair;

    @PostConstruct
    void init() throws Exception {
        if (hasConfiguredKeys()) {
            keyPair = loadFromConfiguration();
            log.info("Loaded JWT key pair from application configuration");
            return;
        }

        if (Files.exists(KEY_FILE)) {
            keyPair = loadFromFile(KEY_FILE);
            log.info("Loaded persisted JWT key pair from {}", KEY_FILE.toAbsolutePath());
            return;
        }

        keyPair = generateKeyPair();
        persistKeyPair(KEY_FILE, keyPair);
        log.info("Generated and persisted JWT key pair to {}", KEY_FILE.toAbsolutePath());
    }

    private boolean hasConfiguredKeys() {
        Health360Properties.Jwt jwt = properties.getJwt();
        return jwt.getPrivateKey() != null && !jwt.getPrivateKey().isBlank()
                && jwt.getPublicKey() != null && !jwt.getPublicKey().isBlank();
    }

    private KeyPair loadFromConfiguration() throws Exception {
        Health360Properties.Jwt jwt = properties.getJwt();
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = keyFactory.generatePrivate(
                new PKCS8EncodedKeySpec(Base64.getDecoder().decode(jwt.getPrivateKey())));
        PublicKey publicKey = keyFactory.generatePublic(
                new X509EncodedKeySpec(Base64.getDecoder().decode(jwt.getPublicKey())));
        return new KeyPair(publicKey, privateKey);
    }

    private KeyPair loadFromFile(Path path) throws Exception {
        Properties props = new Properties();
        try (InputStream input = Files.newInputStream(path)) {
            props.load(input);
        }
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = keyFactory.generatePrivate(
                new PKCS8EncodedKeySpec(Base64.getDecoder().decode(props.getProperty("privateKey"))));
        PublicKey publicKey = keyFactory.generatePublic(
                new X509EncodedKeySpec(Base64.getDecoder().decode(props.getProperty("publicKey"))));
        return new KeyPair(publicKey, privateKey);
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

    private KeyPair generateKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        return generator.generateKeyPair();
    }
}
