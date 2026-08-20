package com.health360.config;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ProductionCorsConfigTest {

    @Test
    void trimsTrailingSlashAndAddsWwwVariant() {
        LinkedHashSet<String> origins = new LinkedHashSet<>();
        ProductionCorsConfig.addOriginAndWwwVariant(origins, "https://hms.techearnest.com/");

        assertThat(origins).containsExactly(
                "https://hms.techearnest.com",
                "https://www.hms.techearnest.com"
        );
    }

    @Test
    void includesAppBaseUrlAndExtraOrigins() {
        Health360Properties properties = new Health360Properties();
        properties.setAppBaseUrl("https://hms.techearnest.com");
        properties.setCorsAllowedOrigins("https://staging.techearnest.com");

        ProductionCorsConfig config = new ProductionCorsConfig(properties);
        List<String> origins = config.resolveAllowedOrigins();

        assertThat(origins).contains(
                "https://hms.techearnest.com",
                "https://www.hms.techearnest.com",
                "https://staging.techearnest.com",
                "https://www.staging.techearnest.com"
        );
    }
}
