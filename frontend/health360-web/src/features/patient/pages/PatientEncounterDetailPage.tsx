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
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import {
  useEncounter,
  useEncounterDiagnoses,
  useEncounterNotes,
  useEncounterOrders,
} from '@/features/clinical/hooks/useClinicalQueries';
import { useEncounterLabReports } from '@/features/lab/hooks/useLabQueries';
import { useEncounterImagingReports } from '@/features/radiology/hooks/useRadiologyQueries';
import { useEncounterProcedures } from '@/features/ot/hooks/useOtQueries';
import { useEncounterAdministrations } from '@/features/pharmacy/hooks/usePharmacyQueries';
import { encounterStatusColor, encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { parseApiError } from '@/shared/api/errorUtils';

export function PatientEncounterDetailPage() {
  const { encounterId = '' } = useParams<{ encounterId: string }>();
  const { data: encounter, isLoading, error } = useEncounter(encounterId);
  const { data: diagnoses = [] } = useEncounterDiagnoses(encounterId);
  const { data: notes = [] } = useEncounterNotes(encounterId);
  const { data: orders = [] } = useEncounterOrders(encounterId);
  const { data: labReports = [] } = useEncounterLabReports(encounterId);
  const { data: imagingReports = [] } = useEncounterImagingReports(encounterId);
  const { data: procedures = [] } = useEncounterProcedures(encounterId);
  const { data: administrations = [] } = useEncounterAdministrations(encounterId);
  const parsedError = error ? parseApiError(error) : null;

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
        <Button component={RouterLink} to="/patient/encounters" sx={{ mt: 2 }}>Back to visits</Button>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Button component={RouterLink} to="/patient/encounters" sx={{ mb: 2 }}>← Back to visits</Button>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4">{encounter.encounterNumber}</Typography>
        <Chip
          label={encounterStatusLabel(encounter.status)}
          color={encounterStatusColor(encounter.status)}
          size="small"
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {encounter.encounterType} · {formatEncounterDate(encounter.startedAt ?? encounter.createdAt)}
      </Typography>

      {encounter.visitReason ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Reason for visit</Typography>
          <Typography>{encounter.visitReason}</Typography>
        </Box>
      ) : null}

      <Stack spacing={3}>
        <Section title="Diagnoses" empty={diagnoses.length === 0}>
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
        </Section>

        <Section title="Clinical notes" empty={notes.length === 0}>
          <List dense disablePadding>
            {notes.map((note) => (
              <ListItem key={note.noteId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={note.noteType}
                  secondary={note.content}
                />
              </ListItem>
            ))}
          </List>
        </Section>

        <Section title="Orders" empty={orders.length === 0}>
          <List dense disablePadding>
            {orders.map((order) => (
              <ListItem key={order.orderId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={`${order.orderType} — ${order.status}`}
                  secondary={
                    <>
                      {order.instructions ? <Typography variant="body2">{order.instructions}</Typography> : null}
                      {order.items.map((item) => (
                        <Typography key={item.itemId} variant="body2" color="text.secondary">
                          {item.itemName}{item.itemCode ? ` (${item.itemCode})` : ''}
                        </Typography>
                      ))}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Section>

        <Section title="Lab results" empty={labReports.length === 0}>
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
        </Section>

        <Section title="Imaging results" empty={imagingReports.length === 0}>
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
        </Section>

        <Section title="Completed procedures" empty={procedures.length === 0}>
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
        </Section>

        <Section title="Medication administration (MAR)" empty={administrations.length === 0}>
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
        </Section>
      </Stack>
    </AnimatedPage>
  );
}

function Section({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <Divider sx={{ mb: 1.5 }} />
      {empty ? <Typography variant="body2" color="text.secondary">None recorded.</Typography> : children}
    </Box>
  );
}
