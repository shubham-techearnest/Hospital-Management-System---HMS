package com.health360.search.application.service;

import com.health360.search.presentation.dto.response.SpecializationOptionResponse;
import com.health360.shared.infrastructure.persistence.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecializationTaxonomyService {

    private final SpecializationRepository specializationRepository;

    @Transactional(readOnly = true)
    public List<SpecializationOptionResponse> listActiveSpecializations() {
        return specializationRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(spec -> SpecializationOptionResponse.builder()
                        .id(spec.getId())
                        .code(spec.getCode())
                        .name(spec.getName())
                        .category(spec.getParentId() != null ? "SUBSPECIALTY" : "PRIMARY")
                        .build())
                .toList();
    }
}
