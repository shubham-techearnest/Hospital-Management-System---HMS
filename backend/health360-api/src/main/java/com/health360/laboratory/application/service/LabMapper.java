package com.health360.laboratory.application.service;

import com.health360.laboratory.infrastructure.persistence.entity.*;
import com.health360.laboratory.presentation.dto.response.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LabMapper {

    public LaboratoryResponse toLaboratoryResponse(LaboratoryEntity entity) {
        return LaboratoryResponse.builder()
                .laboratoryId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .name(entity.getName())
                .code(entity.getCode())
                .active(entity.isActive())
                .build();
    }

    public LabTestResponse toTestResponse(LabTestEntity entity) {
        return LabTestResponse.builder()
                .labTestId(entity.getId())
                .laboratoryId(entity.getLaboratoryId())
                .code(entity.getCode())
                .name(entity.getName())
                .specimenType(entity.getSpecimenType())
                .active(entity.isActive())
                .build();
    }

    public LabTestParameterResponse toParameterResponse(LabTestParameterEntity entity) {
        return LabTestParameterResponse.builder()
                .parameterId(entity.getId())
                .labTestId(entity.getLabTestId())
                .code(entity.getCode())
                .name(entity.getName())
                .unit(entity.getUnit())
                .referenceRange(entity.getReferenceRange())
                .build();
    }

    public LabSampleResponse toSampleResponse(LabSampleEntity entity) {
        return LabSampleResponse.builder()
                .sampleId(entity.getId())
                .labOrderId(entity.getLabOrderId())
                .specimenId(entity.getSpecimenId())
                .collectedAt(entity.getCollectedAt())
                .collectedBy(entity.getCollectedBy())
                .notes(entity.getNotes())
                .build();
    }

    public LabResultResponse toResultResponse(LabResultEntity result, LabTestParameterEntity parameter) {
        return LabResultResponse.builder()
                .resultId(result.getId())
                .labOrderId(result.getLabOrderId())
                .parameterId(result.getParameterId())
                .parameterCode(parameter.getCode())
                .parameterName(parameter.getName())
                .valueText(result.getValueText())
                .valueNumeric(result.getValueNumeric())
                .unit(result.getUnit() != null ? result.getUnit() : parameter.getUnit())
                .referenceRange(parameter.getReferenceRange())
                .status(result.getStatus())
                .recordedAt(result.getRecordedAt())
                .build();
    }

    public LabReportResponse toReportResponse(
            LabReportEntity report, LabTestEntity test, List<LabResultResponse> results) {
        return LabReportResponse.builder()
                .reportId(report.getId())
                .labOrderId(report.getLabOrderId())
                .encounterId(report.getEncounterId())
                .testName(test.getName())
                .testCode(test.getCode())
                .summaryText(report.getSummaryText())
                .releasedAt(report.getReleasedAt())
                .results(results)
                .build();
    }

    public LabOrderResponse toOrderResponse(
            LabOrderEntity order,
            LabTestEntity test,
            LabSampleEntity sample,
            List<LabResultResponse> results,
            LabReportResponse report) {
        return LabOrderResponse.builder()
                .labOrderId(order.getId())
                .clinicalOrderItemId(order.getClinicalOrderItemId())
                .clinicalOrderId(order.getClinicalOrderId())
                .encounterId(order.getEncounterId())
                .patientId(order.getPatientId())
                .hospitalId(order.getHospitalId())
                .branchId(order.getBranchId())
                .labTestId(order.getLabTestId())
                .testCode(test.getCode())
                .testName(test.getName())
                .status(order.getStatus())
                .receivedAt(order.getReceivedAt())
                .sample(sample != null ? toSampleResponse(sample) : null)
                .results(results)
                .report(report)
                .build();
    }
}
