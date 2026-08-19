package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class InviteStaffRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @Size(max = 20)
    private String phone;

    @NotBlank
    @Size(min = 8, max = 100)
    private String temporaryPassword;

    @NotNull
    private UUID hospitalId;

    private UUID branchId;

    private UUID departmentId;

    @NotBlank
    @Size(max = 50)
    private String roleName;

    @Size(max = 100)
    private String jobTitle;
}
