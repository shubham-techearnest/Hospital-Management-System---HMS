package com.health360.shared.exception;

import com.health360.shared.domain.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.List;

@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode code;
    private final HttpStatus status;
    private final List<FieldErrorDetail> details;

    public BusinessException(ErrorCode code, HttpStatus status, String message) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = Collections.emptyList();
    }

    public BusinessException(ErrorCode code, HttpStatus status, String message, List<FieldErrorDetail> details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }

    public record FieldErrorDetail(String field, String message, String code) {
    }
}
