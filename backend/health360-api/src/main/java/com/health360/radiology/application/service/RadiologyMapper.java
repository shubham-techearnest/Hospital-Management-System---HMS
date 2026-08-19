package com.health360.radiology.application.service;

import com.health360.radiology.infrastructure.persistence.entity.*;
import com.health360.radiology.presentation.dto.response.*;
import org.springframework.stereotype.Component;

@Component
public class RadiologyMapper {

    public ImagingModalityResponse toModalityResponse(ImagingModalityEntity entity) {
        return ImagingModalityResponse.builder()
                .modalityId(entity.getId())
                .hospitalId(entity.getHospitalId())
                .branchId(entity.getBranchId())
                .code(entity.getCode())
                .name(entity.getName())
                .modalityType(entity.getModalityType())
                .active(entity.isActive())
                .build();
    }

    public ImagingStudyResponse toStudyResponse(ImagingStudyEntity entity) {
        return ImagingStudyResponse.builder()
                .studyId(entity.getId())
                .imagingOrderId(entity.getImagingOrderId())
                .scheduledAt(entity.getScheduledAt())
                .performedAt(entity.getPerformedAt())
                .performedBy(entity.getPerformedBy())
                .notes(entity.getNotes())
                .build();
    }

    public ImagingReportResponse toReportResponse(ImagingReportEntity report, ImagingModalityEntity modality) {
        return ImagingReportResponse.builder()
                .reportId(report.getId())
                .imagingOrderId(report.getImagingOrderId())
                .encounterId(report.getEncounterId())
                .modalityName(modality.getName())
                .modalityCode(modality.getCode())
                .modalityType(modality.getModalityType())
                .findingsText(report.getFindingsText())
                .impressionText(report.getImpressionText())
                .status(report.getStatus())
                .verifiedAt(report.getVerifiedAt())
                .releasedAt(report.getReleasedAt())
                .build();
    }

    public ImagingOrderResponse toOrderResponse(
            ImagingOrderEntity order,
            ImagingModalityEntity modality,
            ImagingStudyEntity study,
            ImagingReportEntity report) {
        return ImagingOrderResponse.builder()
                .imagingOrderId(order.getId())
                .clinicalOrderItemId(order.getClinicalOrderItemId())
                .clinicalOrderId(order.getClinicalOrderId())
                .encounterId(order.getEncounterId())
                .patientId(order.getPatientId())
                .hospitalId(order.getHospitalId())
                .branchId(order.getBranchId())
                .modalityId(order.getModalityId())
                .modalityCode(modality.getCode())
                .modalityName(modality.getName())
                .modalityType(modality.getModalityType())
                .status(order.getStatus())
                .receivedAt(order.getReceivedAt())
                .study(study != null ? toStudyResponse(study) : null)
                .report(report != null ? toReportResponse(report, modality) : null)
                .build();
    }
}
