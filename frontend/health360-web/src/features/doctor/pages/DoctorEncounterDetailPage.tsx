import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { PatientSummaryPanel } from '@/features/doctor/components/PatientSummaryPanel';
import { usePatientSummary } from '@/features/doctor/hooks/usePatientSummaryQueries';
import {
  useEncounter,
  useEncounterActions,
  useEncounterDiagnoses,
  useEncounterNotes,
  useEncounterOrders,
} from '@/features/clinical/hooks/useClinicalQueries';
import { useBranchLabTests, useEncounterLabReports } from '@/features/lab/hooks/useLabQueries';
import { useEncounterImagingReports, useModalities } from '@/features/radiology/hooks/useRadiologyQueries';
import { useEncounterProcedures } from '@/features/ot/hooks/useOtQueries';
import { useEncounterAdministrations, useMedicines } from '@/features/pharmacy/hooks/usePharmacyQueries';
import { encounterStatusColor, encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { parseApiError } from '@/shared/api/errorUtils';

export function DoctorEncounterDetailPage() {
  const { encounterId = '' } = useParams<{ encounterId: string }>();
  const { data: encounter, isLoading, error, refetch } = useEncounter(encounterId);
  const { data: diagnoses = [] } = useEncounterDiagnoses(encounterId);
  const { data: notes = [] } = useEncounterNotes(encounterId);
  const { data: orders = [] } = useEncounterOrders(encounterId);
  const { data: labReports = [] } = useEncounterLabReports(encounterId);
  const { data: imagingReports = [] } = useEncounterImagingReports(encounterId);
  const { data: procedures = [] } = useEncounterProcedures(encounterId);
  const { data: administrations = [] } = useEncounterAdministrations(encounterId);
  const { data: labTests = [] } = useBranchLabTests(encounter?.hospitalId, encounter?.branchId);
  const { data: modalities = [] } = useModalities(encounter?.hospitalId, encounter?.branchId);
  const { data: medicines = [] } = useMedicines(encounter?.hospitalId, encounter?.branchId);
  const actions = useEncounterActions(encounterId);
  const { data: patientSummary, isLoading: summaryLoading, error: summaryError } = usePatientSummary(
    encounter?.patientId ?? '',
    encounter?.appointmentId ?? '',
    Boolean(encounter?.patientId && encounter?.appointmentId),
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedLabTestId, setSelectedLabTestId] = useState('');
  const [labInstructions, setLabInstructions] = useState('');
  const [selectedModalityId, setSelectedModalityId] = useState('');
  const [imagingInstructions, setImagingInstructions] = useState('');
  const [procedureName, setProcedureName] = useState('');
  const [procedureInstructions, setProcedureInstructions] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [medicationInstructions, setMedicationInstructions] = useState('');
  const parsedError = error ? parseApiError(error) : null;

  const runAction = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setSuccess(null);
    try {
      await fn();
      setSuccess(`${label} successful.`);
      refetch();
    } catch (e) {
      setActionError(parseApiError(e).message);
    }
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

  const canCheckIn = encounter.status === 'REGISTERED';
  const canStart = encounter.status === 'WAITING' || encounter.status === 'REGISTERED';
  const canComplete = encounter.status === 'IN_PROGRESS';
  const canOrderLab = encounter.status === 'IN_PROGRESS' && labTests.length > 0;
  const canOrderImaging = encounter.status === 'IN_PROGRESS' && modalities.length > 0;
  const canOrderProcedure = encounter.status === 'IN_PROGRESS';
  const canOrderMedication = encounter.status === 'IN_PROGRESS' && medicines.length > 0;
  const selectedLabTest = labTests.find((t) => t.labTestId === selectedLabTestId);
  const selectedModality = modalities.find((m) => m.modalityId === selectedModalityId);
  const selectedMedicine = medicines.find((m) => m.medicineId === selectedMedicineId);

  return (
    <AnimatedPage>
      <Button component={RouterLink} to="/doctor/opd" sx={{ mb: 2 }}>← Back to OPD</Button>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4">{encounter.encounterNumber}</Typography>
        <Chip
          label={encounterStatusLabel(encounter.status)}
          color={encounterStatusColor(encounter.status)}
          size="small"
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {encounter.encounterType} · {formatEncounterDate(encounter.startedAt ?? encounter.createdAt)}
      </Typography>

      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
        {canCheckIn ? (
          <Button
            variant="outlined"
            disabled={actions.checkIn.isPending}
            onClick={() => runAction('Check-in', () => actions.checkIn.mutateAsync())}
          >
            Check in
          </Button>
        ) : null}
        {canStart ? (
          <Button
            variant="contained"
            disabled={actions.start.isPending}
            onClick={() => runAction('Start consultation', () => actions.start.mutateAsync())}
          >
            Start consultation
          </Button>
        ) : null}
        {canComplete ? (
          <Button
            variant="contained"
            color="success"
            disabled={actions.complete.isPending}
            onClick={() => runAction('Complete encounter', () => actions.complete.mutateAsync())}
          >
            Complete encounter
          </Button>
        ) : null}
      </Stack>

      {encounter.visitReason ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Reason for visit</Typography>
          <Typography>{encounter.visitReason}</Typography>
        </Box>
      ) : null}

      <Box sx={{ mb: 3 }}>
        {summaryLoading ? <Skeleton variant="rounded" height={120} /> : null}
        {patientSummary ? <PatientSummaryPanel summary={patientSummary} /> : null}
        {!summaryLoading && !patientSummary && summaryError ? (
          <Alert severity="info">Patient summary unavailable for this encounter.</Alert>
        ) : null}
      </Box>

      <Stack spacing={3}>
        <DetailSection title="Diagnoses" empty={diagnoses.length === 0}>
          <List dense disablePadding>
            {diagnoses.map((dx) => (
              <ListItem key={dx.diagnosisId} disableGutters>
                <ListItemText
                  primary={dx.diagnosisText}
                  secondary={[dx.diagnosisType, dx.diagnosisCode].filter(Boolean).join(' · ')}
                />
              </ListItem>
            ))}
          </List>
        </DetailSection>

        <DetailSection title="Clinical notes" empty={notes.length === 0}>
          <List dense disablePadding>
            {notes.map((note) => (
              <ListItem key={note.noteId} disableGutters alignItems="flex-start">
                <ListItemText primary={note.noteType} secondary={note.content} />
              </ListItem>
            ))}
          </List>
        </DetailSection>

        <DetailSection title="Orders" empty={orders.length === 0}>
          {canOrderLab ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
              <TextField select label="Lab test" size="small" sx={{ minWidth: 220 }}
                value={selectedLabTestId}
                onChange={(e) => setSelectedLabTestId(e.target.value)}>
                {labTests.map((test) => (
                  <MenuItem key={test.labTestId} value={test.labTestId}>
                    {test.name} ({test.code})
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Instructions" size="small" fullWidth value={labInstructions}
                onChange={(e) => setLabInstructions(e.target.value)} />
              <Button variant="outlined" disabled={!selectedLabTestId || actions.createOrder.isPending}
                onClick={() => runAction('Lab order', () => actions.createOrder.mutateAsync({
                  orderType: 'LAB',
                  instructions: labInstructions || undefined,
                  items: [{
                    itemCode: selectedLabTest?.code,
                    itemName: selectedLabTest?.name ?? 'Lab test',
                    itemReferenceId: selectedLabTestId,
                  }],
                }))}>
                Order lab test
              </Button>
            </Stack>
          ) : null}
          {canOrderImaging ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
              <TextField select label="Imaging modality" size="small" sx={{ minWidth: 220 }}
                value={selectedModalityId}
                onChange={(e) => setSelectedModalityId(e.target.value)}>
                {modalities.map((modality) => (
                  <MenuItem key={modality.modalityId} value={modality.modalityId}>
                    {modality.name} ({modality.code})
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Instructions" size="small" fullWidth value={imagingInstructions}
                onChange={(e) => setImagingInstructions(e.target.value)} />
              <Button variant="outlined" disabled={!selectedModalityId || actions.createOrder.isPending}
                onClick={() => runAction('Imaging order', () => actions.createOrder.mutateAsync({
                  orderType: 'IMAGING',
                  instructions: imagingInstructions || undefined,
                  items: [{
                    itemCode: selectedModality?.code,
                    itemName: selectedModality?.name ?? 'Imaging study',
                    itemReferenceId: selectedModalityId,
                  }],
                }))}>
                Order imaging
              </Button>
            </Stack>
          ) : null}
          {canOrderMedication ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
              <TextField select label="Medicine" size="small" sx={{ minWidth: 220 }}
                value={selectedMedicineId}
                onChange={(e) => setSelectedMedicineId(e.target.value)}>
                {medicines.map((medicine) => (
                  <MenuItem key={medicine.medicineId} value={medicine.medicineId}>
                    {medicine.name} ({medicine.code})
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Instructions" size="small" fullWidth value={medicationInstructions}
                onChange={(e) => setMedicationInstructions(e.target.value)} />
              <Button variant="outlined" disabled={!selectedMedicineId || actions.createOrder.isPending}
                onClick={() => runAction('Medication order', () => actions.createOrder.mutateAsync({
                  orderType: 'MEDICATION',
                  instructions: medicationInstructions || undefined,
                  items: [{
                    itemCode: selectedMedicine?.code,
                    itemName: selectedMedicine?.name ?? 'Medication',
                    itemReferenceId: selectedMedicineId,
                  }],
                }))}>
                Order medication
              </Button>
            </Stack>
          ) : null}
          {canOrderProcedure ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
              <TextField label="Procedure name" size="small" sx={{ minWidth: 220 }}
                value={procedureName}
                onChange={(e) => setProcedureName(e.target.value)} />
              <TextField label="Instructions" size="small" fullWidth value={procedureInstructions}
                onChange={(e) => setProcedureInstructions(e.target.value)} />
              <Button variant="outlined" disabled={!procedureName.trim() || actions.createOrder.isPending}
                onClick={() => runAction('Procedure order', () => actions.createOrder.mutateAsync({
                  orderType: 'PROCEDURE',
                  instructions: procedureInstructions || undefined,
                  items: [{
                    itemName: procedureName.trim(),
                  }],
                }))}>
                Order procedure
              </Button>
            </Stack>
          ) : null}
          <List dense disablePadding>
            {orders.map((order) => (
              <ListItem key={order.orderId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={`${order.orderType} — ${order.status}`}
                  secondary={order.items.map((item) => item.itemName).join(', ') || order.instructions}
                />
              </ListItem>
            ))}
          </List>
        </DetailSection>

        <DetailSection title="Lab results" empty={labReports.length === 0}>
          <List dense disablePadding>
            {labReports.map((report) => (
              <ListItem key={report.reportId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={`${report.testName} (${report.testCode})`}
                  secondary={
                    <>
                      {report.summaryText ? <Typography variant="body2">{report.summaryText}</Typography> : null}
                      {report.results.map((result) => (
                        <Typography key={result.resultId} variant="body2" color="text.secondary">
                          {result.parameterName}: {result.valueText} {result.unit ?? ''}
                          {result.referenceRange ? ` · ref ${result.referenceRange}` : ''}
                        </Typography>
                      ))}
                      <Typography variant="caption" color="text.secondary" display="block">
                        Released {formatEncounterDate(report.releasedAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DetailSection>

        <DetailSection title="Imaging results" empty={imagingReports.length === 0}>
          <List dense disablePadding>
            {imagingReports.map((report) => (
              <ListItem key={report.reportId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={`${report.modalityName} (${report.modalityCode})`}
                  secondary={
                    <>
                      {report.findingsText ? (
                        <Typography variant="body2">{report.findingsText}</Typography>
                      ) : null}
                      {report.impressionText ? (
                        <Typography variant="body2" color="text.secondary">
                          Impression: {report.impressionText}
                        </Typography>
                      ) : null}
                      {report.releasedAt ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Released {formatEncounterDate(report.releasedAt)}
                        </Typography>
                      ) : null}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DetailSection>

        <DetailSection title="Completed procedures" empty={procedures.length === 0}>
          <List dense disablePadding>
            {procedures.map((procedure) => (
              <ListItem key={procedure.procedureId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={procedure.procedureName}
                  secondary={
                    <>
                      {procedure.theatreName ? (
                        <Typography variant="body2" color="text.secondary">
                          Theatre: {procedure.theatreName}
                        </Typography>
                      ) : null}
                      {procedure.notes.map((note) => (
                        <Typography key={note.noteId} variant="body2" color="text.secondary">
                          {note.noteType}: {note.content}
                        </Typography>
                      ))}
                      {procedure.completedAt ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Completed {formatEncounterDate(procedure.completedAt)}
                        </Typography>
                      ) : null}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DetailSection>

        <DetailSection title="Medication administration (MAR)" empty={administrations.length === 0}>
          <List dense disablePadding>
            {administrations.map((admin) => (
              <ListItem key={admin.administrationId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={`${admin.medicineName} — ${admin.doseGiven}`}
                  secondary={
                    <>
                      {admin.route ? (
                        <Typography variant="body2" color="text.secondary">Route: {admin.route}</Typography>
                      ) : null}
                      {admin.notes ? (
                        <Typography variant="body2" color="text.secondary">{admin.notes}</Typography>
                      ) : null}
                      <Typography variant="caption" color="text.secondary" display="block">
                        Administered {formatEncounterDate(admin.administeredAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DetailSection>
      </Stack>
    </AnimatedPage>
  );
}

function DetailSection({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <Divider sx={{ mb: 1.5 }} />
      {empty ? <Typography variant="body2" color="text.secondary">None recorded.</Typography> : children}
    </Box>
  );
}
