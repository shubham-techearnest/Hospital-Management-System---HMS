package com.health360.iam.application.service;

import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import org.springframework.http.HttpStatus;

final class ImpersonationExceptions {

    private ImpersonationExceptions() {
    }

    static BusinessException disabled() {
        return new BusinessException(ErrorCode.FEATURE_NOT_AVAILABLE, HttpStatus.FORBIDDEN,
                "User impersonation is not available in this environment");
    }

    static BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                "Only Platform Administrators can impersonate users");
    }

    static BusinessException nested() {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN,
                "Nested impersonation is not allowed. Exit the current session first");
    }

    static BusinessException targetNotAllowed(String detail) {
        return new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, detail);
    }

    static BusinessException notFound() {
        return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                "User not found");
    }

    static BusinessException sessionNotFound() {
        return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                "No active impersonation session");
    }

    static BusinessException expired() {
        return new BusinessException(ErrorCode.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED,
                "Impersonation session has expired");
    }
}
