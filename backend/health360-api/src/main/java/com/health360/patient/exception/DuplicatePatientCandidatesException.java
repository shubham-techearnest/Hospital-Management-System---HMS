package com.health360.patient.exception;

import com.health360.patient.presentation.dto.response.DuplicateCandidateResponse;
import lombok.Getter;

import java.util.List;

@Getter
public class DuplicatePatientCandidatesException extends RuntimeException {

    private final List<DuplicateCandidateResponse> candidates;

    public DuplicatePatientCandidatesException(List<DuplicateCandidateResponse> candidates) {
        super("Possible duplicate patient records found");
        this.candidates = candidates;
    }
}
