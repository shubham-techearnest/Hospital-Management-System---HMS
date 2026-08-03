package com.health360.location.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class GeocodeResponse {
    BigDecimal latitude;
    BigDecimal longitude;
    String formattedAddress;
    String source;
}
