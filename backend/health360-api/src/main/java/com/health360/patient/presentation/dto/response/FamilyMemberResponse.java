package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class FamilyMemberResponse {
    UUID id;
    String name;
    String relationship;
    LocalDate dateOfBirth;
    String gender;
    List<String> hereditaryConditions;
    boolean alive;
}
