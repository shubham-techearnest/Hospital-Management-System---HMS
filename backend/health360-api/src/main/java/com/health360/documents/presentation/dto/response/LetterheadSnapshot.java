package com.health360.documents.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class LetterheadSnapshot {
    UUID hospitalId;
    String hospitalName;
    String registrationNumber;
    String accreditation;
    String tagline;
    String footerText;
    boolean hasLogo;
    String logoUrl;
    String branchName;
    String addressLine1;
    String addressLine2;
    String city;
    String state;
    String pincode;
    String phone;
    String email;
}
