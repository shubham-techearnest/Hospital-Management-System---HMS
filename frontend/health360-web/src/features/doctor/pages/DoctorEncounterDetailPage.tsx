import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { PatientSummaryPanel } from '@/features/doctor/components/PatientSummaryPanel';
import {
  DoctorEncounterFingerTabs,
  checklistStepToTab,
  type DoctorEncounterTabId,
} from '@/features/doctor/components/DoctorEncounterFingerTabs';
import { usePatientSummary } from '@/features/doctor/hooks/usePatientSummaryQueries';
import { EncounterVitalsPanel } from '@/features/clinical/components/EncounterVitalsPanel';
import { ClinicalTimelinePanel } from '@/features/clinical/components/ClinicalTimelinePanel';
import { StructuredConsultationPanel } from '@/features/clinical/components/StructuredConsultationPanel';
import { EPrescriptionPanel } from '@/features/clinical/components/EPrescriptionPanel';
import { ClinicalOrdersQuickPanel } from '@/features/clinical/components/ClinicalOrdersQuickPanel';
import { OpdVisitChecklist } from '@/features/clinical/components/OpdVisitChecklist';
import {
  useDoctorEncounters,
  useEncounter,
  useEncounterActions,
  useEncounterDiagnoses,
  useEncounterNotes,
  useEncounterOrders,
  useEncounterPrescriptions,
  useEncounterVitals,
} from '@/features/clinical/hooks/useClinicalQueries';
import { beginEncounter } from '@/features/clinical/api/clinicalApi';
import { useInvoiceByEncounter } from '@/features/billing/hooks/useBillingQueries';
import { buildOpdVisitChecklist, canIssueCheckout, checkoutBlockers } from '@/features/clinical/utils/opdVisitChecklist';
import { isAxiosError } from 'axios';
import { useBranchLabTests, useEncounterLabReports } from '@/features/lab/hooks/useLabQueries';
import { useEncounterImagingReports, useModalities } from '@/features/radiology/hooks/useRadiologyQueries';
import { useEncounterProcedures } from '@/features/ot/hooks/useOtQueries';
import { useEncounterAdministrations } from '@/features/pharmacy/hooks/usePharmacyQueries';
import { useDiagnosisCatalog } from '@/features/hospital/hooks/useClinicalCatalogQueries';
import { encounterStatusColor, encounterStatusLabel } from '@/features/clinical/utils/encounterUtils';
import { patientDisplayLabel, queueStatusLabel } from '@/shared/status/visitStatus';
import { parseApiError } from '@/shared/api/errorUtils';
import { RecommendIpdAdmissionPanel } from '@/features/doctor/components/RecommendIpdAdmissionPanel';
import { useQueryClient } from '@tanstack/react-query';

export function DoctorEncounterDetailPage() {
  const { encounterId = '' } = useParams<{ encounterId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: encounter, isLoading, error, refetch } = useEncounter(encounterId);
  const { data: queueData } = useDoctorEncounters(0, 50, true);
  const { data: diagnoses = [], refetch: refetchDiagnoses } = useEncounterDiagnoses(encounterId);
  const { data: notes = [], refetch: refetchNotes } = useEncounterNotes(encounterId);
  const { data: orders = [], refetch: refetchOrders } = useEncounterOrders(encounterId);
  const { data: vitals = [], refetch: refetchVitals } = useEncounterVitals(encounterId);
  const { data: prescriptions = [], refetch: refetchPrescriptions } = useEncounterPrescriptions(encounterId);
  const invoiceQuery = useInvoiceByEncounter(encounterId);
  const { data: labReports = [] } = useEncounterLabReports(encounterId);
  const { data: imagingReports = [] } = useEncounterImagingReports(encounterId);
  const { data: procedures = [] } = useEncounterProcedures(encounterId);
  const { data: administrations = [] } = useEncounterAdministrations(encounterId);
  const { data: labTests = [] } = useBranchLabTests(encounter?.hospitalId, encounter?.branchId);
  const { data: modalities = [] } = useModalities(encounter?.hospitalId, encounter?.branchId);
  const { data: diagnosisCatalog = [] } = useDiagnosisCatalog(encounter?.hospitalId, encounter?.branchId);
  const actions = useEncounterActions(encounterId);
  const { data: patientSummary, isLoading: summaryLoading, error: summaryError } = usePatientSummary(
    encounter?.patientId ?? '',
    {
      appointmentId: encounter?.appointmentId,
      encounterId: encounterId || undefined,
      enabled: Boolean(encounter?.patientId),
    },
  );

  const [tab, setTab] = useState<DoctorEncounterTabId>('patient');
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [beginning, setBeginning] = useState(false);

  const parsedError = error ? parseApiError(error) : null;
  const invoiceForbidden = isAxiosError(invoiceQuery.error) && invoiceQuery.error.response?.status === 403;
  const visitSteps = useMemo(
    () =>
      buildOpdVisitChecklist({
        vitals,
        notes,
        diagnoses,
        prescriptions,
        orders,
        invoice: invoiceQuery.data,
        invoiceForbidden,
      }),
    [vitals, notes, diagnoses, prescriptions, orders, invoiceQuery.data, invoiceForbidden],
  );

  const refreshClinical = () => {
    void refetch();
    void refetchDiagnoses();
    void refetchNotes();
    void refetchOrders();
    void refetchVitals();
    void refetchPrescriptions();
  };

  const runAction = async (label: string, fn: () => Promise<unknown>, after?: () => void) => {
    setActionError(null);
    setSuccess(null);
    try {
      await fn();
      setSuccess(`${label} successful.`);
      refreshClinical();
      after?.();
    } catch (e) {
      setActionError(parseApiError(e).message);
    }
  };

  const nextWaitingEncounter = useMemo(() => {
    const list = queueData?.content ?? [];
    return list.find(
      (e) =>
        e.encounterId !== encounterId
        && (e.status === 'WAITING' || e.status === 'REGISTERED'),
    );
  }, [queueData, encounterId]);

  const goToNextPatient = () => {
    if (nextWaitingEncounter) {
      navigate(`/doctor/encounters/${nextWaitingEncounter.encounterId}`);
      setTab('vitals');
      return;
    }
    navigate('/doctor/opd');
  };

  if (isLoading) {
    return (
      <AnimatedPage>
        <Skeleton variant="text" width="50%" height={48} />
        <Skeleton variant="rounded" height={200} />
      </AnimatedPage>
    );
  }

  if (parsedError || !encounter) {
    return (
      <AnimatedPage>
        <Alert severity="error">{parsedError?.message ?? 'Encounter not found.'}</Alert>
        <Button component={RouterLink} to="/doctor/opd" sx={{ mt: 2 }}>Back to OPD</Button>
      </AnimatedPage>
    );
  }

  const canBegin = encounter.status === 'WAITING' || encounter.status === 'REGISTERED';
  const checkoutReady = canIssueCheckout(notes, prescriptions);
  const blockers = checkoutBlockers(notes, prescriptions);
  const canEditClinical =
    encounter.status === 'IN_PROGRESS'
    || encounter.status === 'WAITING'
    || (encounter.status === 'COMPLETED' && !checkoutReady);
  const canComplete = encounter.status === 'IN_PROGRESS' && checkoutReady;
  const canOrder = canEditClinical && encounter.status === 'IN_PROGRESS';

  const beginVisit = async () => {
    setBeginning(true);
    setActionError(null);
    try {
      await beginEncounter(encounterId, encounter.status);
      await queryClient.invalidateQueries({ queryKey: ['clinical'] });
      await refetch();
      setSuccess('Visit started — document in the tabs below.');
      setTab('vitals');
    } catch (e) {
      setActionError(parseApiError(e).message);
    } finally {
      setBeginning(false);
    }
  };

  const finishVisit = async () => {
    await runAction('Complete consultation', () => actions.complete.mutateAsync(), () => {
      if (nextWaitingEncounter) {
        setSuccess('Visit complete. Opening next patient…');
        setTimeout(goToNextPatient, 600);
      }
    });
  };

  return (
    <AnimatedPage>
      <Paper
        variant="outlined"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 11,
          p: 1.5,
          mb: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button component={RouterLink} to="/doctor/opd" size="small">← OPD</Button>
          <Typography variant="subtitle1" fontWeight={700}>
            {patientDisplayLabel(encounter.patientName, encounter.uhid) || encounter.encounterNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {encounter.patientName ? patientDisplayLabel(encounter.patientName, encounter.uhid) : encounter.encounterNumber}
            {encounter.uhid ? ` · ${encounter.uhid}` : ''}
          </Typography>
          <Chip label={encounterStatusLabel(encounter.status)} color={encounterStatusColor(encounter.status)} size="small" />
          {encounter.queueStatus ? (
            <Chip label={queueStatusLabel(encounter.queueStatus)} size="small" variant="outlined" />
          ) : null}
          <Box sx={{ flex: 1 }} />
          {canBegin ? (
            <Button variant="contained" size="small" disabled={beginning} onClick={() => void beginVisit()}>
              {beginning ? 'Starting…' : 'Begin visit'}
            </Button>
          ) : null}
          {canComplete ? (
            <Button variant="contained" color="success" size="small" disabled={actions.complete.isPending}
              onClick={() => void finishVisit()}>
              {nextWaitingEncounter ? 'Finish & next' : 'Finish visit'}
            </Button>
          ) : null}
        </Stack>
        {encounter.visitReason ? (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {encounter.visitReason}
          </Typography>
        ) : null}
      </Paper>

      {success ? <Alert severity="success" sx={{ mb: 1 }} onClose={() => setSuccess(null)}>{success}</Alert> : null}
      {actionError ? <Alert severity="error" sx={{ mb: 1 }} onClose={() => setActionError(null)}>{actionError}</Alert> : null}

      {encounter.status === 'IN_PROGRESS' && !checkoutReady ? (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Before finish: {blockers.join(' · ')}.
        </Alert>
      ) : null}

      <DoctorEncounterFingerTabs
        value={tab}
        onChange={setTab}
        steps={visitSteps}
      >
        {tab === 'patient' ? (
          <Stack spacing={2}>
            <OpdVisitChecklist
              steps={visitSteps}
              scrollToSections={false}
              onStepClick={(stepId) => setTab(checklistStepToTab(stepId))}
            />
            {summaryLoading ? <Skeleton variant="rounded" height={100} /> : null}
            {patientSummary ? <PatientSummaryPanel summary={patientSummary} /> : null}
            {!summaryLoading && !patientSummary && summaryError ? (
              <Alert severity="info">Patient summary unavailable for this visit.</Alert>
            ) : null}
            {encounter.visitReason ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Reason for visit</Typography>
                <Typography>{encounter.visitReason}</Typography>
              </Box>
            ) : null}
            <RecommendIpdAdmissionPanel
              encounterId={encounterId}
              patientId={encounter.patientId}
              hospitalId={encounter.hospitalId}
              branchId={encounter.branchId}
              primaryDoctorId={encounter.primaryDoctorId}
              encounterType={encounter.encounterType}
            />
          </Stack>
        ) : null}

        {tab === 'vitals' ? (
          <EncounterVitalsPanel
            encounterId={encounterId}
            canWrite={canEditClinical}
            compact
            lastVitals={patientSummary?.latestVitals}
            onRecorded={() => setTab('consult')}
            onSkip={() => setTab('consult')}
          />
        ) : null}

        {tab === 'consult' ? (
          <StructuredConsultationPanel
            encounterId={encounterId}
            hospitalId={encounter.hospitalId}
            branchId={encounter.branchId}
            visitReason={encounter.visitReason}
            diagnosisCatalog={diagnosisCatalog}
            canEdit={canEditClinical}
            compact
            onFinalized={() => setTab('rx')}
          />
        ) : null}

        {tab === 'rx' ? (
          <EPrescriptionPanel
            encounterId={encounterId}
            hospitalId={encounter.hospitalId}
            branchId={encounter.branchId}
            canEdit={canEditClinical}
            compact
            patientMedications={patientSummary?.medications ?? []}
            onSigned={() => setTab('done')}
          />
        ) : null}

        {tab === 'labs' ? (
          <ClinicalOrdersQuickPanel
            encounterId={encounterId}
            orders={orders}
            labTests={labTests}
            modalities={modalities}
            canOrder={canOrder}
            onOrdered={refetchOrders}
          />
        ) : null}

        {tab === 'done' ? (
          <Stack spacing={2}>
            <OpdVisitChecklist
              steps={visitSteps}
              scrollToSections={false}
              onStepClick={(stepId) => setTab(checklistStepToTab(stepId))}
            />
            {encounter.status === 'COMPLETED' ? (
              <Alert severity="success">
                Handed to reception for billing. Patient sees results in their app.
              </Alert>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {canComplete ? (
                  <Button variant="contained" color="success" disabled={actions.complete.isPending}
                    onClick={() => void finishVisit()}>
                    {nextWaitingEncounter ? 'Finish & next patient' : 'Finish & hand to desk'}
                  </Button>
                ) : (
                  <Button variant="contained" disabled>Finish visit (complete blockers above)</Button>
                )}
                {nextWaitingEncounter ? (
                  <Button variant="outlined" onClick={goToNextPatient}>
                    Skip to next: {patientDisplayLabel(nextWaitingEncounter.patientName, nextWaitingEncounter.uhid)}
                  </Button>
                ) : null}
              </Stack>
            )}

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Patient history & results</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <ClinicalTimelinePanel patientId={encounter.patientId} title="Timeline" />
                  {labReports.length > 0 ? (
                    <HistoryList title="Lab results" items={labReports.map((r) => `${r.testName}: ${r.summaryText ?? '—'}`)} />
                  ) : null}
                  {imagingReports.length > 0 ? (
                    <HistoryList title="Imaging" items={imagingReports.map((r) => r.modalityName)} />
                  ) : null}
                  {procedures.length > 0 ? (
                    <HistoryList title="Procedures" items={procedures.map((p) => p.procedureName)} />
                  ) : null}
                  {administrations.length > 0 ? (
                    <HistoryList title="MAR" items={administrations.map((a) => `${a.medicineName} ${a.doseGiven}`)} />
                  ) : null}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        ) : null}
      </DoctorEncounterFingerTabs>
    </AnimatedPage>
  );
}

function HistoryList({ title, items }: { title: string; items: string[] }) {
  return (
    <Box>
      <Typography variant="subtitle2">{title}</Typography>
      <List dense disablePadding>
        {items.map((item) => (
          <ListItem key={item} disableGutters>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
