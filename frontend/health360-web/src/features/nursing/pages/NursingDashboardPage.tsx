import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { EncounterVitalsPanel } from '@/features/clinical/components/EncounterVitalsPanel';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { IpdOpsMetricsPanel } from '@/features/ipd/components/IpdOpsMetricsPanel';
import { useIpdDashboard } from '@/features/dashboard/hooks/useDashboardQueries';
import { getHospitalIpdServices } from '@/features/hospital/api/hospitalIpdServicesApi';

export function NursingDashboardPage() {
  const scope = useStaffHospitalScope();
  const hospitalId = scope.hospitalId;
  const branchId = scope.branchId;

  const { data: ipdDash, isLoading: ipdDashLoading } = useIpdDashboard(
    { hospitalId, branchId },
    Boolean(hospitalId && branchId),
  );
  const { data: ipdServices } = useQuery({
    queryKey: ['hospital', 'ipd-services', hospitalId],
    queryFn: getHospitalIpdServices,
    enabled: Boolean(hospitalId),
    staleTime: 60_000,
    retry: false,
  });
  const mobileNursingOn = ipdServices?.enabledServices?.IPD_MOBILE_NURSING !== false;

  const [encounterIdInput, setEncounterIdInput] = useState('');
  const [activeEncounterId, setActiveEncounterId] = useState('');

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Nursing overview"
        subtitle="Ward census, bed turnaround, vitals, and MAR — optimized for tablet / phone"
        actions={(
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={RouterLink} to="/nursing/ward" variant="contained" fullWidth={false}>
              Ward board
            </Button>
            <Button component={RouterLink} to="/nursing/mar" variant="outlined">
              Open MAR
            </Button>
          </Stack>
        )}
      />

      <StaffHospitalScopeBar
        {...scope}
        onScopeIndexChange={scope.setActiveScopeIndex}
        onBranchChange={scope.setBranchId}
      />

      <IpdOpsMetricsPanel
        data={ipdDash}
        loading={ipdDashLoading}
        opsTo="/nursing/ward"
        compact={!mobileNursingOn}
      />

      {mobileNursingOn ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Mobile nursing charting is enabled — use Ward board → patient chart for vitals, assessments, and MAR on phone/tablet.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          <code>IPD_MOBILE_NURSING</code> is off — use desktop/web nursing only. Enable it under Hospital → IPD services for phone-first charting guidance.
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        IPD vitals and assessments are on the{' '}
        <Button component={RouterLink} to="/nursing/ward" size="small">
          Ward board
        </Button>
        . Medication administration is on the{' '}
        <Button component={RouterLink} to="/nursing/mar" size="small">
          MAR
        </Button>
        . Paste encounter ID below only for ad-hoc OPD/other visits.
      </Alert>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Encounter vitals (manual)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Prefer opening a patient from the ward board when an IPD admission exists.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: activeEncounterId ? 2 : 0 }}>
          <TextField
            label="Encounter ID"
            size="small"
            fullWidth
            value={encounterIdInput}
            onChange={(e) => setEncounterIdInput(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => setActiveEncounterId(encounterIdInput.trim())}
            disabled={!encounterIdInput.trim()}
            sx={{ flexShrink: 0 }}
          >
            Open vitals
          </Button>
        </Stack>
        {activeEncounterId ? (
          <>
            <Divider sx={{ my: 2 }} />
            <EncounterVitalsPanel key={activeEncounterId} encounterId={activeEncounterId} />
          </>
        ) : null}
      </Paper>
    </AnimatedPage>
  );
}
