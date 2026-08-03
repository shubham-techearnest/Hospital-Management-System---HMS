package com.health360.shared.exception;

import com.health360.shared.domain.ErrorCode;
import com.health360.shared.dto.ErrorResponse;
import com.health360.shared.filter.CorrelationIdFilter;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        List<ErrorResponse.ErrorDetail> details = ex.getDetails().stream()
                .map(d -> ErrorResponse.ErrorDetail.builder()
                        .field(d.field())
                        .message(d.message())
                        .code(d.code())
                        .build())
                .toList();

        ErrorResponse body = details.isEmpty()
                ? ErrorResponse.of(ex.getCode().name(), ex.getMessage(), correlationId())
                : ErrorResponse.of(ex.getCode().name(), ex.getMessage(), correlationId(), details);

        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.ErrorDetail> details = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toDetail)
                .toList();

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(ErrorCode.VALIDATION_ERROR.name(), "Request validation failed",
                        correlationId(), details));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex) {
        List<ErrorResponse.ErrorDetail> details = ex.getConstraintViolations().stream()
                .map(v -> ErrorResponse.ErrorDetail.builder()
                        .field(v.getPropertyPath().toString())
                        .message(v.getMessage())
                        .code(ErrorCode.VALIDATION_ERROR.name())
                        .build())
                .toList();

        return ResponseEntity.badRequest().body(
                ErrorResponse.of(ErrorCode.VALIDATION_ERROR.name(), "Request validation failed",
                        correlationId(), details));
    }

    @ExceptionHandler({BadCredentialsException.class, AccessDeniedException.class, AuthenticationException.class})
    public ResponseEntity<ErrorResponse> handleSecurity(RuntimeException ex) {
        HttpStatus status = ex instanceof AccessDeniedException
                ? HttpStatus.FORBIDDEN : HttpStatus.UNAUTHORIZED;
        ErrorCode code = ex instanceof AccessDeniedException
                ? ErrorCode.FORBIDDEN : ErrorCode.UNAUTHORIZED;
        String message = ex instanceof AccessDeniedException
                ? "Access denied" : (ex.getMessage() != null ? ex.getMessage() : "Authentication required");

        return ResponseEntity.status(status).body(
                ErrorResponse.of(code.name(), message, correlationId()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = "Invalid value for parameter '" + ex.getName() + "'";
        return ResponseEntity.badRequest().body(
                ErrorResponse.of(ErrorCode.VALIDATION_ERROR.name(), message, correlationId()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unhandled exception [correlationId={}]", correlationId(), ex);
        return ResponseEntity.internalServerError().body(
                ErrorResponse.of(ErrorCode.INTERNAL_ERROR.name(), "An unexpected error occurred",
                        correlationId()));
    }

    private ErrorResponse.ErrorDetail toDetail(FieldError fieldError) {
        String code = fieldError.getDefaultMessage();
        if (code != null && code.contains("WEAK_PASSWORD")) {
            code = "WEAK_PASSWORD";
        } else {
            code = ErrorCode.VALIDATION_ERROR.name();
        }
        return ErrorResponse.ErrorDetail.builder()
                .field(fieldError.getField())
                .message(fieldError.getDefaultMessage())
                .code(code)
                .build();
    }

    private String correlationId() {
        String id = MDC.get(CorrelationIdFilter.MDC_KEY);
        return id != null ? id : "unknown";
    }
}
