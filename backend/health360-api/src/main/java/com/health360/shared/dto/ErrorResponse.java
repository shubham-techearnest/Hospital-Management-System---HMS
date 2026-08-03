package com.health360.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    boolean success;
    ErrorBody error;

    @Value
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorBody {
        String code;
        String message;
        List<ErrorDetail> details;
        String correlationId;
        Instant timestamp;
    }

    @Value
    @Builder
    public static class ErrorDetail {
        String field;
        String message;
        String code;
    }

    public static ErrorResponse of(String code, String message, String correlationId) {
        return ErrorResponse.builder()
                .success(false)
                .error(ErrorBody.builder()
                        .code(code)
                        .message(message)
                        .correlationId(correlationId)
                        .timestamp(Instant.now())
                        .build())
                .build();
    }

    public static ErrorResponse of(String code, String message, String correlationId,
                                   List<ErrorDetail> details) {
        return ErrorResponse.builder()
                .success(false)
                .error(ErrorBody.builder()
                        .code(code)
                        .message(message)
                        .details(details)
                        .correlationId(correlationId)
                        .timestamp(Instant.now())
                        .build())
                .build();
    }
}
