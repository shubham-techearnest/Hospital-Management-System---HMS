package com.health360.patient.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateContactInfoRequest {

    @Size(max = 20)
    private String primaryPhone;

    @Size(max = 20)
    private String secondaryPhone;

    @Valid
    private AddressDto permanentAddress;

    @Valid
    private AddressDto currentAddress;

    private Boolean sameAsPermanentAddress;

    @Data
    public static class AddressDto {
        @Size(max = 200)
        private String line1;
        @Size(max = 200)
        private String line2;
        @Size(max = 100)
        private String city;
        @Size(max = 100)
        private String state;
        @Pattern(regexp = "^(\\d{6})?$", message = "Invalid pincode")
        private String pincode;
        @Pattern(regexp = "^([A-Z]{2})?$", message = "Invalid country code")
        private String country;
    }
}
