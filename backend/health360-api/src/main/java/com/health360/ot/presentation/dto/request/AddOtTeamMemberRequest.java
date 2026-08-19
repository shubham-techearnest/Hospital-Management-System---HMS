package com.health360.ot.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AddOtTeamMemberRequest {

    @NotBlank
    @Size(max = 30)
    private String memberRole;

    @NotNull
    private UUID userId;

    @Size(max = 200)
    private String memberName;
}
