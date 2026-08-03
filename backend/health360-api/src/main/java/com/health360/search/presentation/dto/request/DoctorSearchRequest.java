package com.health360.search.presentation.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DoctorSearchRequest {
    private String q;
    private String specialization;
    private String hospital;
    private String city;
    private String department;
    private Integer minExperience;
    private String language;
    private String gender;
    private Boolean availableToday;
    private String consultationMode;
    private BigDecimal minRating;
    private BigDecimal maxFee;
    private Double latitude;
    private Double longitude;
    private Double maxDistance;
    private String sort = "RELEVANCE";
    private int page = 0;
    private int size = 20;
}
