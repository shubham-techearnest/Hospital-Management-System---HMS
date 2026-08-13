package com.health360.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DatabaseEnvironmentPostProcessorTest {

    @Test
    void parseRenderStyleDatabaseUrl() {
        DatabaseEnvironmentPostProcessor.ParsedDatabaseUrl parsed =
                DatabaseEnvironmentPostProcessor.parsePostgresUrl(
                        "postgresql://health3600:secret@dpg-example-a/health360_db");

        assertEquals(
                "jdbc:postgresql://dpg-example-a:5432/health360_db?sslmode=require",
                parsed.jdbcUrl());
        assertEquals("health3600", parsed.username());
        assertEquals("secret", parsed.password());
    }

    @Test
    void parsePostgresAliasScheme() {
        DatabaseEnvironmentPostProcessor.ParsedDatabaseUrl parsed =
                DatabaseEnvironmentPostProcessor.parsePostgresUrl(
                        "postgres://user:p%40ss@db.example.com:5433/mydb?sslmode=require");

        assertTrue(parsed.jdbcUrl().startsWith("jdbc:postgresql://db.example.com:5433/mydb?"));
        assertEquals("user", parsed.username());
        assertEquals("p@ss", parsed.password());
    }
}
