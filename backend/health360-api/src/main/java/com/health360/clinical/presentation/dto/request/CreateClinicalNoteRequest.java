package com.health360.clinical.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateClinicalNoteRequest {

    @Size(max = 30)
    private String noteType;

    @Size(max = 10000)
    private String content;

    @Size(max = 5000)
    private String chiefComplaint;

    @Size(max = 10000)
    private String hpi;

    @Size(max = 10000)
    private String examination;

    @Size(max = 5000)
    private String assessment;

    @Size(max = 5000)
    private String plan;
}
