package com.health360.search.presentation.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class HospitalSearchRequest {
    private String q;
    private String department;
    private String facility;
    private Boolean emergency24x7;
    private Boolean icuAvailable;
    private BigDecimal minRating;
    private Double latitude;
    private Double longitude;
    private Double maxDistance;
    private String sort = "RELEVANCE";
    private int page = 0;
    private int size = 20;
}
