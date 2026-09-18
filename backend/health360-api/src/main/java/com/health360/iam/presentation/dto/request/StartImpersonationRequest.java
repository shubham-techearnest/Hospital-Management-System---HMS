package com.health360.iam.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class StartImpersonationRequest {

    @NotNull
    private UUID targetUserId;

    @Size(max = 500)
    private String reason;
}
