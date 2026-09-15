import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import {
  fetchConsultationDocument,
  fetchLabReportDocument,
  fetchPharmacyDispenseSlip,
  fetchPrescriptionDocument,
  type ClinicalDocument,
} from '@/features/documents/api/documentsApi';
import { HospitalLetterhead } from '@/features/documents/components/HospitalLetterhead';
import { DocumentPatientBlock } from '@/features/documents/components/DocumentPatientBlock';
import { DocumentFooter } from '@/features/documents/components/DocumentFooter';
import '@/features/documents/documentPrint.css';

type DocKind = 'prescription' | 'consultation' | 'lab' | 'pharmacy';

function useClinicalDocument(kind: DocKind | undefined, params: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ['clinical-document', kind, params],
    enabled: Boolean(kind),
    queryFn: async (): Promise<ClinicalDocument> => {
      if (kind === 'prescription') {
        return fetchPrescriptionDocument(params.encounterId!, params.prescriptionId!);
      }
      if (kind === 'consultation') {
        return fetchConsultationDocument(params.encounterId!, params.noteId!);
      }
      if (kind === 'lab') {
        return fetchLabReportDocument(params.labOrderId!);
      }
      return fetchPharmacyDispenseSlip(params.requestId!);
    },
  });
}

function Section({ title, body }: { title: string; body?: string | null }) {
  if (!body?.trim()) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{body}</Typography>
    </Box>
  );
}

function DocumentBody({ doc }: { doc: ClinicalDocument }) {
  if (doc.documentType === 'PRESCRIPTION' && doc.medications) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 1, fontFamily: 'serif' }}>℞</Typography>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {doc.medications.map((m) => (
            <li key={m.sequence} style={{ marginBottom: 10 }}>
              <Typography variant="body1" fontWeight={600}>{m.medicineName}</Typography>
              <Typography variant="body2">
                {[m.doseText, m.frequency, m.durationText, m.route].filter(Boolean).join(' · ')}
              </Typography>
              {m.howToTake ? (
                <Typography variant="body2" color="text.secondary">{m.howToTake}</Typography>
              ) : null}
              {m.instructions && m.instructions !== m.howToTake ? (
                <Typography variant="caption" display="block">{m.instructions}</Typography>
              ) : null}
            </li>
          ))}
        </ol>
        {doc.notes ? (
          <Typography variant="body2" sx={{ mt: 2 }}><strong>Notes:</strong> {doc.notes}</Typography>
        ) : null}
      </Box>
    );
  }

  if (doc.documentType === 'CONSULTATION' && doc.consultation) {
    const c = doc.consultation;
    return (
      <Box>
        <Section title="Chief complaint" body={c.chiefComplaint} />
        <Section title="History of present illness" body={c.hpi} />
        <Section title="Examination" body={c.examination} />
        <Section title="Assessment" body={c.assessment} />
        <Section title="Plan" body={c.plan} />
        {!c.chiefComplaint && !c.hpi && !c.examination && !c.assessment && !c.plan ? (
          <Section title="Notes" body={c.content} />
        ) : null}
      </Box>
    );
  }

  if (doc.documentType === 'LAB_REPORT' && doc.lab) {
    return (
      <Box>
        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }} flexWrap="wrap">
          <Typography variant="caption">Ordered: {doc.lab.orderedAt ?? '—'}</Typography>
          <Typography variant="caption">Sample: {doc.lab.sampleCollectedAt ?? '—'}</Typography>
          <Typography variant="caption">Reported: {doc.lab.reportedAt ?? '—'}</Typography>
          {doc.lab.critical ? (
            <Typography variant="caption" color="error.main" fontWeight={700}>CRITICAL</Typography>
          ) : null}
        </Stack>
        <table>
          <thead>
            <tr>
              <th>Test / Parameter</th>
              <th>Result</th>
              <th>Unit</th>
              <th>Reference</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {(doc.lab.results ?? []).map((r, idx) => (
              <tr key={`${r.testName}-${idx}`}>
                <td>{r.testName}</td>
                <td>{r.valueText ?? '—'}</td>
                <td>{r.unit ?? '—'}</td>
                <td>{r.referenceRange ?? '—'}</td>
                <td>{r.flag ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {doc.lab.summaryText ? (
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Summary:</strong> {doc.lab.summaryText}
          </Typography>
        ) : null}
      </Box>
    );
  }

  if (doc.documentType === 'PHARMACY_DISPENSE' && doc.pharmacy) {
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Slip: {doc.pharmacy.requestNumber ?? doc.documentNumber}
          {doc.pharmacy.dispensedAt ? ` · Dispensed: ${doc.pharmacy.dispensedAt}` : ''}
        </Typography>
        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Qty</th>
              <th>How to take</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(doc.pharmacy.lines ?? []).map((line, idx) => (
              <tr key={`${line.medicineName}-${idx}`}>
                <td>{line.medicineName}</td>
                <td>{line.quantity ?? '—'}</td>
                <td>{line.howToTake ?? '—'}</td>
                <td>{line.amountText ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {doc.pharmacy.totalAmountText ? (
          <Typography variant="body1" fontWeight={700} sx={{ mt: 1.5 }}>
            Total: {doc.pharmacy.totalAmountText}
          </Typography>
        ) : null}
        {doc.notes ? (
          <Typography variant="body2" sx={{ mt: 1 }}><strong>Pharmacist notes:</strong> {doc.notes}</Typography>
        ) : null}
      </Box>
    );
  }

  return <Typography color="text.secondary">No document content.</Typography>;
}

export function ClinicalDocumentPrintPage({ kind }: { kind: DocKind }) {
  const navigate = useNavigate();
  const params = useParams<Record<string, string>>();
  const { data, isLoading, isError, error } = useClinicalDocument(kind, params);

  if (isLoading) {
    return <Typography sx={{ p: 3 }}>Loading document…</Typography>;
  }

  if (isError || !data) {
    return <Alert severity="error" sx={{ m: 2 }}>{parseApiError(error).message}</Alert>;
  }

  return (
    <AnimatedPage>
      <Box className="no-print">
        <DashboardPageHeader
          title={data.documentTitle}
          subtitle="Print-ready letterheaded clinical document"
          actions={(
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
              <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
                Print / Save PDF
              </Button>
            </Stack>
          )}
        />
      </Box>

      <Paper className="clinical-document-print" variant="outlined" sx={{ p: 3, maxWidth: 820, mx: 'auto' }}>
        <HospitalLetterhead
          letterhead={data.letterhead}
          documentTitle={data.documentTitle}
          documentNumber={data.documentNumber}
          issuedAt={data.issuedAt}
        />
        <DocumentPatientBlock patient={data.patient} />
        <DocumentBody doc={data} />
        <DocumentFooter
          clinician={data.clinician}
          letterhead={data.letterhead}
          signatoryLabel={
            data.documentType === 'LAB_REPORT'
              ? 'Verified by'
              : data.documentType === 'PHARMACY_DISPENSE'
                ? 'Pharmacist'
                : 'Consulting doctor'
          }
        />
      </Paper>
    </AnimatedPage>
  );
}
