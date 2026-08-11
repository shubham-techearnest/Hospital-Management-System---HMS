package com.health360.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.health360.iam.presentation.dto.request.LoginRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public final class IntegrationTestAuth {

    public static final String PLATFORM_ADMIN_EMAIL = "platform.admin@health360.test";
    public static final String HOSPITAL_ADMIN_EMAIL = "hospital.admin@health360.test";
    public static final String DEV_PASSWORD = "SecureP@ss1!";

    private IntegrationTestAuth() {
    }

    public static String loginAndGetAccessToken(MockMvc mockMvc, ObjectMapper objectMapper, String email)
            throws Exception {
        return loginAndGetAccessToken(mockMvc, objectMapper, email, DEV_PASSWORD);
    }

    public static String loginAndGetAccessToken(
            MockMvc mockMvc, ObjectMapper objectMapper, String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.path("data").path("accessToken").asText();
    }

    public static String bearer(String accessToken) {
        return "Bearer " + accessToken;
    }
}
