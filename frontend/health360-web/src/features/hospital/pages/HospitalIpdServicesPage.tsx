import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import {
  applyHospitalIpdServicePreset,
  getHospitalIpdServices,
  updateHospitalIpdServices,
  type HospitalIpdServices,
} from '../api/hospitalIpdServicesApi';

export function HospitalIpdServicesPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hospital', 'ipd-services'],
    queryFn: getHospitalIpdServices,
  });

  const [draft, setDraft] = useState<HospitalIpdServices | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error('Nothing to save');
      return updateHospitalIpdServices({
        presetCode: draft.presetCode ?? undefined,
        countryCode: draft.countryCode,
        enabledServices: draft.enabledServices,
        countryConfig: draft.countryConfig,
      });
    },
    onSuccess: (next) => {
      setDraft(next);
      setMessage('IPD services saved.');
      setSaveError(null);
      void qc.invalidateQueries({ queryKey: ['hospital', 'ipd-services'] });
    },
    onError: (e) => {
      setSaveError(parseApiError(e).message);
      setMessage(null);
    },
  });

  const presetMutation = useMutation({
    mutationFn: (presetCode: string) => applyHospitalIpdServicePreset(presetCode),
    onSuccess: (next) => {
      setDraft(next);
      setMessage(`Applied preset: ${next.presetCode}`);
      setSaveError(null);
      void qc.invalidateQueries({ queryKey: ['hospital', 'ipd-services'] });
    },
    onError: (e) => {
      setSaveError(parseApiError(e).message);
      setMessage(null);
    },
  });

  const enabledCount = useMemo(
    () => Object.values(draft?.enabledServices ?? {}).filter(Boolean).length,
    [draft],
  );

  const toggleService = (key: string, enabled: boolean) => {
    if (!draft) return;
    if (key === 'IPD_CORE' && !enabled) {
      setSaveError('IPD_CORE must stay enabled while inpatient is used. Turn off FEATURE_IPD on the plan to disable the module.');
      return;
    }
    setDraft({
      ...draft,
      presetCode: null,
      enabledServices: { ...draft.enabledServices, [key]: enabled },
      catalog: draft.catalog.map((item) => (item.key === key ? { ...item, enabled } : item)),
    });
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="IPD services"
        subtitle="Choose which inpatient capabilities this hospital runs. Different hospital types enable different services."
      />

      {isLoading ? <Typography>Loading IPD services…</Typography> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>{parseApiError(error).message}</Alert> : null}
      {saveError ? <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert> : null}
      {message ? <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert> : null}

      {draft ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Plan entitlement</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    color={draft.planFeatureIpdEnabled ? 'success' : 'default'}
                    label={draft.planFeatureIpdEnabled ? 'FEATURE_IPD on' : 'FEATURE_IPD off'}
                  />
                  <Chip
                    size="small"
                    color={draft.planFeatureIcuEnabled ? 'success' : 'default'}
                    label={draft.planFeatureIcuEnabled ? 'FEATURE_ICU on' : 'FEATURE_ICU off'}
                  />
                  <Chip size="small" variant="outlined" label={`${enabledCount} services enabled`} />
                </Stack>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                <TextField
                  select
                  size="small"
                  label="Country pack"
                  value={draft.countryCode}
                  onChange={(e) => setDraft({ ...draft, countryCode: e.target.value })}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="IN">India (IN)</MenuItem>
                  <MenuItem value="AE">UAE (AE)</MenuItem>
                  <MenuItem value="GB">UK (GB)</MenuItem>
                  <MenuItem value="US">USA (US)</MenuItem>
                  <MenuItem value="AU">Australia (AU)</MenuItem>
                </TextField>
                <Button
                  variant="contained"
                  disabled={saveMutation.isPending || !draft.planFeatureIpdEnabled}
                  onClick={() => saveMutation.mutate()}
                >
                  {saveMutation.isPending ? 'Saving…' : 'Save services'}
                </Button>
              </Stack>
            </Stack>
            {!draft.planFeatureIpdEnabled ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                IPD is not on this hospital&apos;s subscription plan. Upgrade or enable FEATURE_IPD before saving.
              </Alert>
            ) : null}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Hospital type presets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              One-click starting point. You can still toggle individual services after applying a preset.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {draft.presets.map((preset) => (
                <Button
                  key={preset.code}
                  size="small"
                  variant={draft.presetCode === preset.code ? 'contained' : 'outlined'}
                  disabled={presetMutation.isPending || !draft.planFeatureIpdEnabled}
                  onClick={() => presetMutation.mutate(preset.code)}
                >
                  {preset.label}
                </Button>
              ))}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Service catalog
            </Typography>
            <Stack spacing={0.5}>
              {draft.catalog.map((item) => (
                <FormControlLabel
                  key={item.key}
                  control={
                    <Switch
                      checked={Boolean(draft.enabledServices[item.key])}
                      onChange={(_, checked) => toggleService(item.key, checked)}
                      disabled={!draft.planFeatureIpdEnabled || (item.key === 'IPD_CORE' && Boolean(draft.enabledServices.IPD_CORE))}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.key}</Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', ml: 0, py: 0.75 }}
                />
              ))}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              India / country pack flags
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Controls discharge gates and claim modes. Self-pay hospitals can leave insurance gates off.
            </Typography>
            <Stack spacing={0.5}>
              {[
                ['cashlessSupported', 'Cashless claims'],
                ['reimbursementSupported', 'Reimbursement claims'],
                ['coPaySupported', 'Co-pay'],
                ['packageBillingSupported', 'Package billing'],
                ['requireFinancialClearanceBeforeDischarge', 'Require financial clearance before discharge'],
                ['requirePreAuthWhenInsurance', 'Require pre-auth when insurance/TPA payer'],
                ['requireDepositBeforeAdmit', 'Require deposit before admit (informational)'],
                ['requireDischargeMedRecon', 'Require DISCHARGE med recon before order/complete'],
                ['requireDischargeOrderBeforeComplete', 'Require discharge order before complete'],
                ['requireMultiDeptClearanceBeforeDischarge', 'Require multi-dept clearances before discharge'],
              ].map(([key, label]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Switch
                      checked={Boolean(draft.countryConfig?.[key])}
                      disabled={!draft.planFeatureIpdEnabled}
                      onChange={(_, checked) => setDraft({
                        ...draft,
                        countryConfig: { ...draft.countryConfig, [key]: checked },
                      })}
                    />
                  }
                  label={label}
                  sx={{ ml: 0 }}
                />
              ))}
              <TextField
                size="small"
                type="number"
                label="Readmission window (days)"
                disabled={!draft.planFeatureIpdEnabled}
                value={Number(draft.countryConfig?.readmissionWindowDays ?? 30)}
                onChange={(e) => setDraft({
                  ...draft,
                  countryConfig: {
                    ...draft.countryConfig,
                    readmissionWindowDays: Math.max(1, Number(e.target.value) || 30),
                  },
                })}
                sx={{ mt: 1, maxWidth: 280 }}
                inputProps={{ min: 1 }}
              />
            </Stack>
          </Paper>
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
