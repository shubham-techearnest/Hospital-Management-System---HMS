package com.health360.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI health360OpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Health360 AI API")
                        .description("Phase 1 REST API — Modular Monolith")
                        .version("0.1.0")
                        .contact(new Contact().name("Health360 Engineering")));
    }
}
