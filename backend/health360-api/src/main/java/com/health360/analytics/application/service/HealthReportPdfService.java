package com.health360.analytics.application.service;

import com.health360.analytics.presentation.dto.response.DashboardResponse;
import com.health360.analytics.presentation.dto.response.GoalProgressResponse;
import com.health360.analytics.presentation.dto.response.MetricResponse;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HealthReportPdfService {

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
    private static final Font HEADING_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font BODY_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm").withZone(ZoneId.systemDefault());

    private final HealthDashboardService healthDashboardService;

    @Transactional
    public byte[] generateReport(UUID userId, UUID tenantId) {
        DashboardResponse dashboard = healthDashboardService.getDashboard(userId, tenantId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("Health360 Health Report", TITLE_FONT));
            document.add(new Paragraph(" "));
            if (dashboard.getCalculatedAt() != null) {
                document.add(new Paragraph("Generated: " + DATE_FORMAT.format(dashboard.getCalculatedAt()), BODY_FONT));
            }
            document.add(new Paragraph(" "));

            addScoreSection(document, dashboard);
            addMetricsSection(document, dashboard.getMetrics());
            addGoalsSection(document, dashboard.getGoalsProgress());
            addDisclaimer(document, dashboard.getDisclaimer());

            document.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new IllegalStateException("Unable to generate health report PDF", e);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to generate health report PDF", e);
        }
    }

    private void addScoreSection(Document document, DashboardResponse dashboard) throws DocumentException {
        document.add(new Paragraph("Summary Scores", HEADING_FONT));
        document.add(new Paragraph("Profile Completion: " + dashboard.getCompletionScore() + "%", BODY_FONT));

        if (dashboard.getWellnessScore() != null && dashboard.getWellnessScore().getScore() != null) {
            document.add(new Paragraph(
                    "Wellness Score: " + dashboard.getWellnessScore().getScore()
                            + (dashboard.getWellnessScore().getLabel() != null
                            ? " (" + dashboard.getWellnessScore().getLabel() + ")" : ""),
                    BODY_FONT));
        }

        if (dashboard.getHealthRiskScore() != null && dashboard.getHealthRiskScore().getScore() != null) {
            document.add(new Paragraph(
                    "Health Risk Score: " + dashboard.getHealthRiskScore().getScore()
                            + (dashboard.getHealthRiskScore().getLabel() != null
                            ? " (" + dashboard.getHealthRiskScore().getLabel() + ")" : ""),
                    BODY_FONT));
        }
        document.add(new Paragraph(" "));
    }

    private void addMetricsSection(Document document, List<MetricResponse> metrics) throws DocumentException {
        if (metrics == null || metrics.isEmpty()) {
            return;
        }
        document.add(new Paragraph("Health Metrics", HEADING_FONT));
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.addCell(headerCell("Metric"));
        table.addCell(headerCell("Value"));
        table.addCell(headerCell("Classification"));

        for (MetricResponse metric : metrics) {
            table.addCell(bodyCell(metric.getMetricType().name()));
            String value = metric.getDisplayValue() != null
                    ? metric.getDisplayValue()
                    : (metric.getValue() != null ? metric.getValue().toPlainString()
                    + (metric.getUnit() != null ? " " + metric.getUnit() : "") : "—");
            table.addCell(bodyCell(value));
            table.addCell(bodyCell(metric.getClassification() != null
                    ? metric.getClassification().name() : "—"));
        }
        document.add(table);
        document.add(new Paragraph(" "));
    }

    private void addGoalsSection(Document document, List<GoalProgressResponse> goals) throws DocumentException {
        if (goals == null || goals.isEmpty()) {
            return;
        }
        document.add(new Paragraph("Health Goals Progress", HEADING_FONT));
        for (GoalProgressResponse goal : goals) {
            document.add(new Paragraph(
                    goal.getLabel() + ": " + goal.getCurrentValue() + " / " + goal.getTargetValue()
                            + " " + goal.getUnit()
                            + (goal.getProgressPercent() != null ? " (" + goal.getProgressPercent() + "%)" : ""),
                    BODY_FONT));
        }
        document.add(new Paragraph(" "));
    }

    private void addDisclaimer(Document document, String disclaimer) throws DocumentException {
        if (disclaimer != null && !disclaimer.isBlank()) {
            document.add(new Paragraph("Disclaimer", HEADING_FONT));
            document.add(new Paragraph(disclaimer, BODY_FONT));
        }
    }

    private PdfPCell headerCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, HEADING_FONT));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        return cell;
    }

    private PdfPCell bodyCell(String text) {
        return new PdfPCell(new Phrase(text != null ? text : "—", BODY_FONT));
    }
}
