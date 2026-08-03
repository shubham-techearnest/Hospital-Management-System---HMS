package com.health360.iam.presentation.validation;

import com.health360.iam.presentation.dto.request.ChangePasswordRequest;
import com.health360.iam.presentation.dto.request.RegisterRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, Object> {

    @Override
    public boolean isValid(Object request, ConstraintValidatorContext context) {
        if (request instanceof RegisterRequest registerRequest) {
            return passwordsMatch(registerRequest.getPassword(), registerRequest.getConfirmPassword());
        }
        if (request instanceof ChangePasswordRequest changePasswordRequest) {
            return passwordsMatch(changePasswordRequest.getNewPassword(), changePasswordRequest.getConfirmPassword());
        }
        return true;
    }

    private boolean passwordsMatch(String password, String confirmPassword) {
        if (password == null || confirmPassword == null) {
            return true;
        }
        return password.equals(confirmPassword);
    }
}
