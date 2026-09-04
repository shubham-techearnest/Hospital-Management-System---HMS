import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { useLabMutations, useLaboratories } from '@/features/lab/hooks/useLabQueries';

export function LabCatalogPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = (profile?.id ?? staffScope.hospitalId).trim();
  const branchId = (primaryBranch?.id ?? staffScope.branchId).trim();
  const showStaffScope = !profile?.id;
  const scopeReady = Boolean(hospitalId && branchId);

  const { data: laboratories = [] } = useLaboratories(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
  );
  const mutations = useLabMutations(hospitalId, branchId);

  const [setupForm, setSetupForm] = useState({
    labName: '', labCode: '', testCode: '', testName: '', laboratoryId: '',
  });
  const [paramForm, setParamForm] = useState({
    labTestId: '', code: '', name: '', unit: '', referenceRange: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const activeLabId = setupForm.laboratoryId || laboratories[0]?.laboratoryId || '';

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Lab catalog"
        subtitle="Laboratories, tests, and parameters for this branch"
      />

      {showStaffScope ? (
        <StaffHospitalScopeBar
          {...staffScope}
          onScopeIndexChange={staffScope.setActiveScopeIndex}
          onBranchChange={staffScope.setBranchId}
        />
      ) : null}

      {!scopeReady ? (
        <Alert severity="info">Select a hospital and branch to manage the catalog.</Alert>
      ) : (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Create laboratory</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField label="Name" size="small" value={setupForm.labName}
                onChange={(e) => setSetupForm({ ...setupForm, labName: e.target.value })} />
              <TextField label="Code" size="small" value={setupForm.labCode}
                onChange={(e) => setSetupForm({ ...setupForm, labCode: e.target.value })} />
            </Stack>
            <Button
              variant="contained"
              disabled={mutations.createLaboratory.isPending}
              onClick={async () => {
                try {
                  const lab = await mutations.createLaboratory.mutateAsync({
                    hospitalId,
                    branchId,
                    name: setupForm.labName.trim(),
                    code: setupForm.labCode.trim(),
                  });
                  setSetupForm({ ...setupForm, laboratoryId: lab.laboratoryId, labName: '', labCode: '' });
                  setSnackbar({ open: true, message: 'Laboratory created.', severity: 'success' });
                } catch (e) {
                  showError(e);
                }
              }}
            >
              Create laboratory
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Add test</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField
                select
                label="Laboratory"
                size="small"
                sx={{ minWidth: 180 }}
                value={activeLabId}
                onChange={(e) => setSetupForm({ ...setupForm, laboratoryId: e.target.value })}
              >
                {laboratories.map((lab) => (
                  <MenuItem key={lab.laboratoryId} value={lab.laboratoryId}>{lab.name}</MenuItem>
                ))}
              </TextField>
              <TextField label="Test code" size="small" value={setupForm.testCode}
                onChange={(e) => setSetupForm({ ...setupForm, testCode: e.target.value })} />
              <TextField label="Test name" size="small" value={setupForm.testName}
                onChange={(e) => setSetupForm({ ...setupForm, testName: e.target.value })} />
            </Stack>
            <Button
              variant="contained"
              disabled={!activeLabId || mutations.createTest.isPending}
              onClick={async () => {
                try {
                  await mutations.createTest.mutateAsync({
                    laboratoryId: activeLabId,
                    code: setupForm.testCode.trim(),
                    name: setupForm.testName.trim(),
                    specimenType: 'BLOOD',
                  });
                  setSetupForm({ ...setupForm, testCode: '', testName: '' });
                  setSnackbar({ open: true, message: 'Test added to catalog.', severity: 'success' });
                } catch (e) {
                  showError(e);
                }
              }}
            >
              Add test
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Add parameter to a test</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Paste a lab test ID from an open order, or add parameters from the order detail page.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField label="Lab test ID" size="small" value={paramForm.labTestId}
                onChange={(e) => setParamForm({ ...paramForm, labTestId: e.target.value })} />
              <TextField label="Code" size="small" value={paramForm.code}
                onChange={(e) => setParamForm({ ...paramForm, code: e.target.value })} />
              <TextField label="Name" size="small" value={paramForm.name}
                onChange={(e) => setParamForm({ ...paramForm, name: e.target.value })} />
              <TextField label="Unit" size="small" value={paramForm.unit}
                onChange={(e) => setParamForm({ ...paramForm, unit: e.target.value })} />
              <TextField label="Reference range" size="small" value={paramForm.referenceRange}
                onChange={(e) => setParamForm({ ...paramForm, referenceRange: e.target.value })} />
            </Stack>
            <Button
              variant="outlined"
              disabled={!paramForm.labTestId.trim() || mutations.createParameter.isPending}
              onClick={async () => {
                try {
                  await mutations.createParameter.mutateAsync({
                    labTestId: paramForm.labTestId.trim(),
                    code: paramForm.code.trim(),
                    name: paramForm.name.trim(),
                    unit: paramForm.unit || undefined,
                    referenceRange: paramForm.referenceRange || undefined,
                  });
                  setParamForm({ labTestId: paramForm.labTestId, code: '', name: '', unit: '', referenceRange: '' });
                  setSnackbar({ open: true, message: 'Parameter added.', severity: 'success' });
                } catch (e) {
                  showError(e);
                }
              }}
            >
              Add parameter
            </Button>
          </Paper>

          <Button component={RouterLink} to="/lab/worklist" variant="text">
            Back to worklist
          </Button>
        </Stack>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
