import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { EncounterVitalsPanel } from '@/features/clinical/components/EncounterVitalsPanel';
import { ClinicalTimelinePanel } from '@/features/clinical/components/ClinicalTimelinePanel';
import { StructuredConsultationPanel } from '@/features/clinical/components/StructuredConsultationPanel';
import { EPrescriptionPanel } from '@/features/clinical/components/EPrescriptionPanel';
import { ClinicalOrdersQuickPanel } from '@/features/clinical/components/ClinicalOrdersQuickPanel';
import { PatientSummaryPanel } from '@/features/doctor/components/PatientSummaryPanel';
import { usePatientSummary } from '@/features/doctor/hooks/usePatientSummaryQueries';
import { useEncounterOrders } from '@/features/clinical/hooks/useClinicalQueries';
import { useDiagnosisCatalog } from '@/features/hospital/hooks/useClinicalCatalogQueries';
import { useBranchLabTests, useEncounterLabReports } from '@/features/lab/hooks/useLabQueries';
import { useEncounterImagingReports, useModalities } from '@/features/radiology/hooks/useRadiologyQueries';
import { useEncounterProcedures } from '@/features/ot/hooks/useOtQueries';
import { useEncounterAdministrations } from '@/features/pharmacy/hooks/usePharmacyQueries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHospitalIpdServices } from '@/features/hospital/api/hospitalIpdServicesApi';
import { acknowledgeCriticalLabReport } from '@/features/lab/api/labApi';
import { MedicationReconciliationPanel } from '@/features/ipd/components/MedicationReconciliationPanel';
import { IpdCareTransitionsPanel } from '@/features/ipd/components/IpdCareTransitionsPanel';
import { IpdBillingPanel } from '@/features/ipd/components/IpdBillingPanel';
import { IpdDischargeWorkflowPanel } from '@/features/ipd/components/IpdDischargeWorkflowPanel';
import { useIpdAdmission, useIpdMutations, useIpdRounds } from '@/features/ipd/hooks/useIpdQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import { patientDisplayLabel } from '@/shared/status/visitStatus';

export type IpdChartPortal = 'doctor' | 'nurse' | 'hospital';

type ChartTab =
  | 'overview'
  | 'timeline'
  | 'clinical'
  | 'nursing'
  | 'meds'
  | 'orders'
  | 'diagnostics'
  | 'more'
  | 'billing'
  | 'discharge';

const TAB_DEFS: Array<{ id: ChartTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'clinical', label: 'Clinical' },
  { id: 'nursing', label: 'Nursing' },
  { id: 'meds', label: 'Meds' },
  { id: 'orders', label: 'Orders' },
  { id: 'diagnostics', label: 'Lab / Rad / OT' },
  { id: 'more', label: 'Consults / Plan / Docs' },
  { id: 'billing', label: 'Billing' },
  { id: 'discharge', label: 'Discharge' },
];

function formatWhen(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type Props = {
  portal: IpdChartPortal;
  backTo: string;
  backLabel: string;
  title: string;
  subtitle: string;
};

export function IpdPatientChart({ portal, backTo, backLabel, title, subtitle }: Props) {
  const { admissionId = '' } = useParams<{ admissionId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<ChartTab>('overview');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [nursingNotes, setNursingNotes] = useState('');
  const [assessment, setAssessment] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [assessmentTemplate, setAssessmentTemplate] = useState('GENERAL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: admission, isLoading, isError } = useIpdAdmission(admissionId || undefined);
  const encounterId = admission?.encounterId ?? '';
  const { data: rounds = [], isLoading: roundsLoading } = useIpdRounds(admissionId || undefined);
  const mutations = useIpdMutations(admission?.hospitalId ?? '', admission?.branchId ?? '');

  const { data: orders = [], refetch: refetchOrders } = useEncounterOrders(encounterId);
  const { data: labTests = [] } = useBranchLabTests(admission?.hospitalId, admission?.branchId);
  const { data: modalities = [] } = useModalities(admission?.hospitalId, admission?.branchId);
  const { data: diagnosisCatalog = [] } = useDiagnosisCatalog(admission?.hospitalId, admission?.branchId);
  const { data: labReports = [] } = useEncounterLabReports(encounterId);
  const { data: imagingReports = [] } = useEncounterImagingReports(encounterId);
  const { data: procedures = [] } = useEncounterProcedures(encounterId);
  const { data: administrations = [] } = useEncounterAdministrations(encounterId);
  const { data: patientSummary, isLoading: summaryLoading, error: summaryError } = usePatientSummary(
    admission?.patientId ?? '',
    { encounterId: encounterId || undefined, enabled: Boolean(admission?.patientId && encounterId) },
  );
  const { data: ipdServices } = useQuery({
    queryKey: ['hospital', 'ipd-services'],
    queryFn: getHospitalIpdServices,
    staleTime: 60_000,
  });
  const queryClient = useQueryClient();
  const acknowledgeCritical = async (reportId: string) => {
    try {
      const note = window.prompt('Acknowledgement note (optional)') ?? undefined;
      await acknowledgeCriticalLabReport(reportId, { note: note?.trim() || undefined });
      setSnackbar({ open: true, message: 'Critical lab acknowledged', severity: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['lab', 'encounters'] });
    } catch (e) {
      setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });
    }
  };

  const doctorRounds = useMemo(() => rounds.filter((r) => r.roundType === 'DOCTOR'), [rounds]);
  const nursingRounds = useMemo(() => rounds.filter((r) => r.roundType === 'NURSING'), [rounds]);
  const handoverRounds = useMemo(
    () => rounds.filter((r) => r.notes.toUpperCase().startsWith('HANDOVER')),
    [rounds],
  );

  const canWriteClinical = portal === 'doctor' && admission?.status === 'ADMITTED';
  const canWriteVitals = (portal === 'doctor' || portal === 'nurse') && admission?.status === 'ADMITTED';
  const canWriteNursing = portal === 'nurse' && admission?.status === 'ADMITTED';
  const canWriteDoctorRounds = portal === 'doctor' && admission?.status === 'ADMITTED';
  const canOrder = canWriteClinical;
  const canManageTransitions =
    (portal === 'doctor' || portal === 'hospital') && admission?.status === 'ADMITTED';
  const otIntegrationOn = ipdServices?.enabledServices?.IPD_OT_INTEGRATION !== false;

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const saveRound = async (roundType: 'DOCTOR' | 'NURSING', notes: string, clear: () => void, okMessage: string) => {
    if (!admissionId || !notes.trim()) return;
    try {
      await mutations.addRound.mutateAsync({ admissionId, roundType, notes: notes.trim() });
      clear();
      setSnackbar({ open: true, message: okMessage, severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  const applyAssessmentTemplate = (template = assessmentTemplate) => {
    if (template === 'GENERAL') {
      setAssessment(
        [
          'ASSESSMENT',
          'Fall risk: ',
          'Pain (0–10): ',
          'Skin integrity: ',
          'Mobility: ',
          'Education given: ',
        ].join('\n'),
      );
      return;
    }
    if (template === 'ADMISSION') {
      setDoctorNotes(
        [
          'Admission assessment',
          `Reason: ${admission?.admissionReason ?? ''}`,
          'History / comorbidities: ',
          'Examination: ',
          'Provisional diagnosis: ',
          'Initial plan: ',
        ].join('\n'),
      );
      setTab('clinical');
      return;
    }
    setHandoverNotes(
      [
        'HANDOVER',
        'Situation: ',
        'Background: ',
        'Assessment: ',
        'Recommendation: ',
        'Pending tasks: ',
      ].join('\n'),
    );
  };

  const bedLabel = admission
    ? [admission.wardCode, admission.roomCode, admission.bedNumber].filter(Boolean).join(' / ') || '—'
    : '—';

  const visibleTabs = TAB_DEFS.filter((t) => {
    if (t.id === 'discharge' && portal === 'nurse') return false;
    return true;
  });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title={title}
        subtitle={subtitle}
        actions={(
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button component={RouterLink} to={backTo} variant="outlined">
              {backLabel}
            </Button>
            {portal === 'doctor' && admission?.encounterId ? (
              <Button
                component={RouterLink}
                to={`/doctor/encounters/${admission.encounterId}`}
                variant="outlined"
              >
                Encounter view
              </Button>
            ) : null}
            {portal === 'nurse' ? (
              <Button component={RouterLink} to="/nursing/mar" variant="outlined">
                MAR worklist
              </Button>
            ) : null}
          </Stack>
        )}
      />

      {isLoading ? <Typography color="text.secondary">Loading admission…</Typography> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load this admission.</Alert> : null}

      {admission ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {patientDisplayLabel(admission.patientName, undefined)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  UHID {admission.uhid ?? '—'} · {admission.admissionNumber} · Encounter {admission.encounterNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bed {bedLabel} · Admitted {formatWhen(admission.admittedAt)}
                </Typography>
                {admission.admissionReason ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Reason: {admission.admissionReason}
                  </Typography>
                ) : null}
              </Box>
              <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" useFlexGap>
                <Chip label={admission.status} color={admission.status === 'ADMITTED' ? 'success' : 'default'} />
                <Chip label={admission.encounterStatus} variant="outlined" />
                {admission.careLevel ? <Chip label={admission.careLevel} variant="outlined" color="info" /> : null}
                {admission.isolationRequired ? <Chip label="ISOLATION" color="warning" /> : null}
                {admission.readmittedFromAdmissionId ? (
                  <Chip label="READMISSION" color="warning" variant="outlined" />
                ) : null}
                {admission.followUpAppointmentId ? (
                  <Chip label="FOLLOW-UP LINKED" variant="outlined" color="info" />
                ) : null}
              </Stack>
            </Stack>
          </Paper>

          <Tabs
            value={tab}
            onChange={(_, v: ChartTab) => setTab(v)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {visibleTabs.map((t) => (
              <Tab key={t.id} value={t.id} label={t.label} />
            ))}
          </Tabs>

          {tab === 'overview' ? (
            <Stack spacing={2}>
              {patientSummary ? <PatientSummaryPanel summary={patientSummary} /> : null}
              {summaryLoading ? <Typography color="text.secondary">Loading patient summary…</Typography> : null}
              {!summaryLoading && !patientSummary && summaryError ? (
                <Alert severity="info">Patient summary unavailable for this admission.</Alert>
              ) : null}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Admission snapshot</Typography>
                <Typography variant="body2">Encounter status: {admission.encounterStatus}</Typography>
                <Typography variant="body2">Bed: {bedLabel}</Typography>
                <Typography variant="body2">
                  Care level: {admission.careLevel ?? 'WARD'}
                  {admission.isolationRequired ? ' · Isolation required' : ''}
                </Typography>
                <Typography variant="body2">Doctor rounds: {doctorRounds.length} · Nursing entries: {nursingRounds.length}</Typography>
                <Typography variant="body2">Open orders: {orders.length} · MAR events: {administrations.length}</Typography>
              </Paper>
              <IpdCareTransitionsPanel
                admission={admission}
                enabledServices={ipdServices?.enabledServices}
                canManage={canManageTransitions}
                portal={portal}
                onMessage={(message, severity) => setSnackbar({ open: true, message, severity })}
              />
              <Paper variant="outlined" sx={{ p: 2 }}>
                <EncounterVitalsPanel
                  key={encounterId}
                  encounterId={encounterId}
                  canWrite={canWriteVitals}
                  compact
                  lastVitals={patientSummary?.latestVitals}
                />
              </Paper>
            </Stack>
          ) : null}

          {tab === 'timeline' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <ClinicalTimelinePanel patientId={admission.patientId} title="Clinical timeline" />
            </Paper>
          ) : null}

          {tab === 'clinical' ? (
            <Stack spacing={2}>
              {canWriteDoctorRounds ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }} alignItems={{ sm: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
                      Admission / progress notes
                    </Typography>
                    <TextField
                      select
                      size="small"
                      label="Template"
                      value={assessmentTemplate}
                      onChange={(e) => setAssessmentTemplate(e.target.value)}
                      sx={{ minWidth: 180 }}
                    >
                      <MenuItem value="GENERAL">Nursing assessment seed</MenuItem>
                      <MenuItem value="ADMISSION">Doctor admission assessment</MenuItem>
                      <MenuItem value="HANDOVER">Handover (SBAR)</MenuItem>
                    </TextField>
                    <Button variant="outlined" onClick={() => applyAssessmentTemplate()}>Apply</Button>
                  </Stack>
                  <TextField
                    label="Doctor round / admission assessment"
                    multiline
                    minRows={4}
                    fullWidth
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Examination findings, plan, orders to nursing…"
                  />
                  <Button
                    sx={{ mt: 1.5 }}
                    variant="contained"
                    disabled={!doctorNotes.trim() || mutations.addRound.isPending}
                    onClick={() => void saveRound('DOCTOR', doctorNotes, () => setDoctorNotes(''), 'Doctor note saved.')}
                  >
                    Save doctor note
                  </Button>
                </Paper>
              ) : null}

              <StructuredConsultationPanel
                encounterId={encounterId}
                hospitalId={admission.hospitalId}
                branchId={admission.branchId}
                visitReason={admission.admissionReason}
                diagnosisCatalog={diagnosisCatalog}
                canEdit={canWriteClinical}
              />

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Doctor round history</Typography>
                {roundsLoading ? <Typography color="text.secondary">Loading…</Typography> : null}
                {!roundsLoading && doctorRounds.length === 0 ? (
                  <Typography color="text.secondary">No doctor rounds yet.</Typography>
                ) : null}
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                  {doctorRounds.map((round) => (
                    <Box key={round.roundId}>
                      <Typography variant="caption" color="text.secondary">{formatWhen(round.recordedAt)}</Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{round.notes}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          ) : null}

          {tab === 'nursing' ? (
            <Stack spacing={2}>
              {canWriteNursing || canWriteDoctorRounds ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Record nursing round</Typography>
                  <TextField
                    label="Round notes"
                    multiline
                    minRows={3}
                    fullWidth
                    value={nursingNotes}
                    onChange={(e) => setNursingNotes(e.target.value)}
                    disabled={!canWriteNursing}
                    placeholder="Observations, care given, patient response…"
                  />
                  <Button
                    sx={{ mt: 1.5 }}
                    variant="contained"
                    disabled={!canWriteNursing || !nursingNotes.trim() || mutations.addRound.isPending}
                    onClick={() => void saveRound('NURSING', nursingNotes, () => setNursingNotes(''), 'Nursing round saved.')}
                  >
                    Save nursing round
                  </Button>
                </Paper>
              ) : null}

              {canWriteNursing ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Nursing assessment</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Free-text assessment tagged with ASSESSMENT (structured forms come in a later wave).
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => {
                      setAssessmentTemplate('GENERAL');
                      applyAssessmentTemplate('GENERAL');
                    }}>
                      Seed template
                    </Button>
                  </Stack>
                  <TextField
                    label="Assessment"
                    multiline
                    minRows={4}
                    fullWidth
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                  />
                  <Button
                    sx={{ mt: 1.5 }}
                    variant="contained"
                    disabled={!assessment.trim() || mutations.addRound.isPending}
                    onClick={() => void saveRound(
                      'NURSING',
                      assessment.startsWith('ASSESSMENT') ? assessment : `ASSESSMENT\n${assessment}`,
                      () => setAssessment(''),
                      'Nursing assessment saved.',
                    )}
                  >
                    Save assessment
                  </Button>
                </Paper>
              ) : null}

              {(canWriteNursing || canWriteDoctorRounds) ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Structured handover (SBAR)</Typography>
                  <TextField
                    label="Handover notes"
                    multiline
                    minRows={4}
                    fullWidth
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="HANDOVER / SBAR…"
                  />
                  <Button
                    sx={{ mt: 1.5 }}
                    variant="contained"
                    disabled={!handoverNotes.trim() || mutations.addRound.isPending}
                    onClick={() => void saveRound(
                      portal === 'nurse' ? 'NURSING' : 'DOCTOR',
                      handoverNotes.toUpperCase().startsWith('HANDOVER')
                        ? handoverNotes
                        : `HANDOVER\n${handoverNotes}`,
                      () => setHandoverNotes(''),
                      'Handover saved.',
                    )}
                  >
                    Save handover
                  </Button>
                  {handoverRounds.length > 0 ? (
                    <Stack spacing={1} sx={{ mt: 2 }} divider={<Divider flexItem />}>
                      {handoverRounds.map((r) => (
                        <Box key={r.roundId}>
                          <Typography variant="caption" color="text.secondary">
                            {r.roundType} · {formatWhen(r.recordedAt)}
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{r.notes}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : null}
                </Paper>
              ) : null}

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Nursing history</Typography>
                {nursingRounds.length === 0 ? (
                  <Typography color="text.secondary">No nursing entries yet.</Typography>
                ) : null}
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                  {nursingRounds.map((round) => (
                    <Box key={round.roundId}>
                      <Typography variant="caption" color="text.secondary">{formatWhen(round.recordedAt)}</Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{round.notes}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          ) : null}

          {tab === 'meds' ? (
            <Stack spacing={2}>
              <MedicationReconciliationPanel
                admissionId={admission.admissionId}
                hospitalId={admission.hospitalId}
                branchId={admission.branchId}
                canEdit={canWriteClinical || portal === 'hospital'}
                homeMedications={patientSummary?.medications ?? []}
                defaultReconType={admission.status === 'DISCHARGED' ? 'DISCHARGE' : 'ADMIT'}
              />
              <EPrescriptionPanel
                encounterId={encounterId}
                hospitalId={admission.hospitalId}
                branchId={admission.branchId}
                canEdit={canWriteClinical}
                patientMedications={patientSummary?.medications ?? []}
              />
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Administrations (MAR)</Typography>
                {administrations.length === 0 ? (
                  <Typography color="text.secondary">No administrations recorded for this encounter yet.</Typography>
                ) : (
                  <Stack spacing={1} divider={<Divider flexItem />}>
                    {administrations.map((a) => (
                      <Typography key={a.administrationId} variant="body2">
                        {a.medicineName}
                        {a.outcome && a.outcome !== 'GIVEN' ? ` · ${a.outcome}` : ''}
                        {' · '}
                        {a.doseGiven}
                        {a.reasonText ? ` — ${a.reasonText}` : ''}
                        {a.administeredAt ? ` · ${formatWhen(a.administeredAt)}` : ''}
                      </Typography>
                    ))}
                  </Stack>
                )}
                {portal === 'nurse' ? (
                  <Button sx={{ mt: 1.5 }} component={RouterLink} to="/nursing/mar" variant="outlined">
                    Open MAR worklist
                  </Button>
                ) : null}
              </Paper>
            </Stack>
          ) : null}

          {tab === 'orders' ? (
            <ClinicalOrdersQuickPanel
              encounterId={encounterId}
              orders={orders}
              labTests={labTests}
              modalities={modalities}
              canOrder={canOrder}
              enabledServices={ipdServices?.enabledServices}
              onOpenMedsTab={() => setTab('meds')}
              onOrdered={() => { void refetchOrders(); }}
            />
          ) : null}

          {tab === 'diagnostics' ? (
            <Stack spacing={2}>
              {labReports.some((r) => r.critical && !r.criticalAcknowledgedAt) ? (
                <Alert severity="error">
                  Critical lab result(s) pending acknowledgement.
                </Alert>
              ) : null}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Lab reports</Typography>
                {labReports.length === 0 ? <Typography color="text.secondary">No lab reports yet.</Typography> : null}
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                  {labReports.map((r) => (
                    <Box key={r.reportId}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="body2" fontWeight={600}>{r.testName}</Typography>
                        {r.critical ? (
                          <Chip
                            size="small"
                            color={r.criticalAcknowledgedAt ? 'default' : 'error'}
                            label={r.criticalAcknowledgedAt ? 'Critical · ACK' : 'CRITICAL'}
                          />
                        ) : null}
                        <Typography variant="caption" color="text.secondary">
                          {formatWhen(r.releasedAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2">{r.summaryText ?? '—'}</Typography>
                      {r.critical && !r.criticalAcknowledgedAt && (canWriteClinical || canWriteNursing || portal === 'hospital') ? (
                        <Button size="small" sx={{ mt: 0.5 }} variant="contained" color="error"
                          onClick={() => void acknowledgeCritical(r.reportId)}>
                          Acknowledge critical
                        </Button>
                      ) : null}
                      {r.criticalAckNote ? (
                        <Typography variant="caption" color="text.secondary">Ack note: {r.criticalAckNote}</Typography>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Imaging</Typography>
                {imagingReports.length === 0 ? <Typography color="text.secondary">No imaging reports yet.</Typography> : null}
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                  {imagingReports.map((r) => (
                    <Box key={r.reportId}>
                      <Typography variant="body2" fontWeight={600}>
                        {r.modalityName}
                        {r.releasedAt ? ` · ${formatWhen(r.releasedAt)}` : ''}
                      </Typography>
                      {r.impressionText ? (
                        <Typography variant="body2">Impression: {r.impressionText}</Typography>
                      ) : null}
                      {r.findingsText ? (
                        <Typography variant="body2" color="text.secondary">Findings: {r.findingsText}</Typography>
                      ) : null}
                      {!r.impressionText && !r.findingsText ? (
                        <Typography variant="body2" color="text.secondary">No narrative yet ({r.status}).</Typography>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Procedures / OT</Typography>
                {!otIntegrationOn ? (
                  <Typography variant="body2" color="text.secondary">
                    OT integration is disabled for this hospital&apos;s IPD service catalog.
                  </Typography>
                ) : null}
                {otIntegrationOn && procedures.length === 0 ? (
                  <Typography color="text.secondary">No procedures linked yet. Place a PROCEDURE order, then receive in OT.</Typography>
                ) : null}
                {otIntegrationOn ? (
                  <Stack spacing={1}>
                    {procedures.map((p) => (
                      <Stack key={p.procedureId} direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="body2">
                          {p.procedureName} · {p.status}
                        </Typography>
                        {portal === 'hospital' ? (
                          <Button
                            size="small"
                            component={RouterLink}
                            to="/hospital/ot"
                            variant="outlined"
                          >
                            OT worklist
                          </Button>
                        ) : null}
                      </Stack>
                    ))}
                  </Stack>
                ) : null}
              </Paper>
            </Stack>
          ) : null}

          {tab === 'more' ? (
            <Stack spacing={2}>
              <Alert severity="info">
                Specialist consult lifecycle, care-plan documents, and patient document binders ship in later I3/I4 waves.
                Use Clinical notes and Nursing handover for now.
              </Alert>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Quick links</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button size="small" variant="outlined" onClick={() => setTab('clinical')}>Clinical assessment</Button>
                  <Button size="small" variant="outlined" onClick={() => setTab('nursing')}>Handover / nursing</Button>
                  <Button size="small" variant="outlined" onClick={() => setTab('orders')}>Orders</Button>
                </Stack>
              </Paper>
            </Stack>
          ) : null}

          {tab === 'billing' ? (
            <Stack spacing={2}>
              <IpdBillingPanel
                admission={admission}
                enabledServices={ipdServices?.enabledServices}
                canManage={portal === 'hospital' && admission.status === 'ADMITTED'}
                onMessage={(message, severity) => setSnackbar({ open: true, message, severity })}
              />
              {portal !== 'hospital' ? (
                <Alert severity="info">Hospital staff record deposits, interim bills, and clearance on this chart.</Alert>
              ) : null}
            </Stack>
          ) : null}

          {tab === 'discharge' ? (
            <IpdDischargeWorkflowPanel
              admission={admission}
              enabledServices={ipdServices?.enabledServices}
              canManage={portal === 'hospital'}
              canOrder={portal === 'doctor'}
              portal={portal}
              onMessage={(message, severity) => setSnackbar({ open: true, message, severity })}
              onDischarged={(encId) => {
                if (portal === 'hospital' && encId) {
                  navigate(`/hospital/billing/checkout/${encId}`, {
                    state: { from: 'ipd', mode: 'IPD' },
                  });
                }
              }}
            />
          ) : null}
        </Stack>
      ) : null}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
