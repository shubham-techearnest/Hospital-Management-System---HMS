import { useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import {
  ASSET_STATUSES,
  MAINTENANCE_TYPES,
  type HospitalAsset,
} from '@/features/asset/api/assetApi';
import {
  useAssetCategories,
  useAssetMaintenance,
  useAssetMutations,
  useAssetSchedules,
  useAssetTickets,
  useAssetTicketsForAsset,
  useAssets,
} from '@/features/asset/hooks/useAssetQueries';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  AVAILABLE: 'success',
  IN_USE: 'info',
  MAINTENANCE: 'warning',
  UNDER_REPAIR: 'error',
  RETIRED: 'default',
  DISPOSED: 'error',
};

export interface AssetManagementPanelProps {
  hospitalId?: string;
  branchId?: string;
  title?: string;
  subtitle?: string;
}

export function AssetManagementPanel({
  hospitalId,
  branchId,
  title = 'Asset management',
  subtitle = 'Register assets, commission, schedule PM, report breakdowns, and close tickets.',
}: AssetManagementPanelProps) {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [qrLookup, setQrLookup] = useState('');
  const [breakdownNotes, setBreakdownNotes] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const { data: categories = [] } = useAssetCategories();
  const { data: assetsPage } = useAssets(
    hospitalId,
    branchId,
    page,
    statusFilter || undefined,
    categoryFilter || undefined,
    search || undefined,
  );
  const assets = assetsPage?.content ?? [];
  const totalPages = assetsPage?.totalPages ?? 0;
  const selectedAsset = assets.find((a) => a.assetId === selectedAssetId) ?? null;
  const { data: maintenance = [] } = useAssetMaintenance(selectedAssetId || undefined);
  const { data: assetTickets = [] } = useAssetTicketsForAsset(selectedAssetId || undefined);
  const { data: schedules = [] } = useAssetSchedules(selectedAssetId || undefined);
  const { data: openTicketsPage } = useAssetTickets(hospitalId, branchId);
  const openTickets = openTicketsPage?.content ?? [];
  const mutations = useAssetMutations(hospitalId ?? '', branchId ?? '');

  const [form, setForm] = useState({
    name: '',
    assetTag: '',
    categoryId: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    locationLabel: '',
    notes: '',
  });
  const [statusTarget, setStatusTarget] = useState('AVAILABLE');
  const [maintForm, setMaintForm] = useState({ maintenanceType: 'PREVENTIVE', notes: '' });
  const [scheduleForm, setScheduleForm] = useState({ scheduleType: 'PREVENTIVE', cadence: 'MONTHLY' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const resetForm = () =>
    setForm({
      name: '',
      assetTag: '',
      categoryId: categories[0]?.categoryId ?? '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      locationLabel: '',
      notes: '',
    });

  const handleCreate = async () => {
    if (!hospitalId || !branchId) return;
    if (!form.name.trim() || !form.assetTag.trim() || !form.categoryId) {
      setSnackbar({ open: true, message: 'Name, asset tag, and category are required', severity: 'error' });
      return;
    }
    try {
      await mutations.create.mutateAsync({
        hospitalId,
        branchId,
        categoryId: form.categoryId,
        name: form.name.trim(),
        assetTag: form.assetTag.trim(),
        manufacturer: form.manufacturer || undefined,
        model: form.model || undefined,
        serialNumber: form.serialNumber || undefined,
        locationLabel: form.locationLabel || undefined,
        notes: form.notes || undefined,
      });
      resetForm();
      setSnackbar({ open: true, message: 'Asset registered', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  const handleStatus = async (asset: HospitalAsset) => {
    try {
      await mutations.updateStatus.mutateAsync({ assetId: asset.assetId, status: statusTarget });
      setSnackbar({ open: true, message: `Status → ${statusTarget}`, severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  const handleMaintenance = async () => {
    if (!selectedAssetId) return;
    try {
      await mutations.addMaintenance.mutateAsync({
        assetId: selectedAssetId,
        payload: {
          maintenanceType: maintForm.maintenanceType,
          notes: maintForm.notes || undefined,
        },
      });
      setMaintForm({ maintenanceType: 'PREVENTIVE', notes: '' });
      setSnackbar({ open: true, message: 'Maintenance logged', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  const handleCommission = async () => {
    if (!selectedAssetId) return;
    try {
      await mutations.commission.mutateAsync(selectedAssetId);
      setSnackbar({ open: true, message: 'Asset commissioned', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  const handleBreakdown = async () => {
    if (!selectedAssetId) return;
    if (!breakdownNotes.trim()) {
      setSnackbar({ open: true, message: 'Describe the breakdown', severity: 'error' });
      return;
    }
    try {
      await mutations.breakdown.mutateAsync({ assetId: selectedAssetId, description: breakdownNotes.trim() });
      setBreakdownNotes('');
      setSnackbar({ open: true, message: 'Breakdown ticket opened', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedAssetId) return;
    try {
      await mutations.createSchedule.mutateAsync({
        assetId: selectedAssetId,
        scheduleType: scheduleForm.scheduleType,
        cadence: scheduleForm.cadence,
        nextDueAt: new Date().toISOString(),
      });
      setSnackbar({ open: true, message: 'PM schedule created (due now)', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  const handleGenerateDue = async () => {
    try {
      const tickets = await mutations.generateDue.mutateAsync();
      setSnackbar({
        open: true,
        message: `Generated ${tickets.length} due ticket(s)`,
        severity: 'success',
      });
    } catch (e) {
      showError(e);
    }
  };

  const handleQrLookup = async () => {
    if (!qrLookup.trim()) return;
    try {
      const asset = await mutations.lookupQr.mutateAsync(qrLookup.trim());
      setSelectedAssetId(asset.assetId);
      setSearch(asset.assetTag);
      setSnackbar({ open: true, message: `Found ${asset.assetTag}`, severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  if (!hospitalId || !branchId) {
    return (
      <AnimatedPage>
        <Alert severity="info">Select a hospital branch to manage assets.</Alert>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Stack spacing={2}>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Register asset
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              sx={{ minWidth: 180 }}
            />
            <TextField
              size="small"
              label="Asset tag"
              value={form.assetTag}
              onChange={(e) => setForm((f) => ({ ...f, assetTag: e.target.value }))}
              sx={{ minWidth: 140 }}
            />
            <TextField
              select
              size="small"
              label="Category"
              value={form.categoryId || categories[0]?.categoryId || ''}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              sx={{ minWidth: 180 }}
            >
              {categories.map((c) => (
                <MenuItem key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Manufacturer"
              value={form.manufacturer}
              onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
            />
            <TextField
              size="small"
              label="Model"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            />
            <TextField
              size="small"
              label="Serial"
              value={form.serialNumber}
              onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
            />
            <TextField
              size="small"
              label="Location"
              value={form.locationLabel}
              onChange={(e) => setForm((f) => ({ ...f, locationLabel: e.target.value }))}
              sx={{ minWidth: 200 }}
            />
            <Button variant="contained" onClick={handleCreate} disabled={mutations.create.isPending}>
              Register
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              label="Search tag / name / QR"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
            />
            <TextField
              size="small"
              label="QR lookup (AST:uuid)"
              value={qrLookup}
              onChange={(e) => setQrLookup(e.target.value)}
            />
            <Button size="small" variant="outlined" onClick={handleQrLookup}>
              Lookup QR
            </Button>
            <Button size="small" variant="outlined" onClick={handleGenerateDue} disabled={mutations.generateDue.isPending}>
              Generate due PM tickets
            </Button>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setPage(0);
                setStatusFilter(e.target.value);
              }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All</MenuItem>
              {ASSET_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Category"
              value={categoryFilter}
              onChange={(e) => {
                setPage(0);
                setCategoryFilter(e.target.value);
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tag</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>QR</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((a) => (
                  <TableRow
                    key={a.assetId}
                    hover
                    selected={a.assetId === selectedAssetId}
                    onClick={() => setSelectedAssetId(a.assetId)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{a.assetTag}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {a.qrPayload ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{a.categoryName ?? a.categoryCode ?? '—'}</TableCell>
                    <TableCell>{a.locationLabel ?? '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={a.status} color={STATUS_COLOR[a.status] ?? 'default'} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          select
                          size="small"
                          value={statusTarget}
                          onChange={(e) => setStatusTarget(e.target.value)}
                          sx={{ minWidth: 130 }}
                        >
                          {ASSET_STATUSES.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Button size="small" onClick={() => handleStatus(a)}>
                          Set status
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {assets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        No assets found for this branch.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Page {page + 1} / {Math.max(totalPages, 1)}
            </Typography>
            <Button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </Stack>
        </Paper>

        {selectedAsset && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detail — {selectedAsset.assetTag} ({selectedAsset.name})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              QR: <span style={{ fontFamily: 'monospace' }}>{selectedAsset.qrPayload ?? '—'}</span>
              {selectedAsset.commissionedAt
                ? ` · Commissioned ${new Date(selectedAsset.commissionedAt).toLocaleString()}`
                : ' · Not commissioned'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <Button size="small" variant="outlined" onClick={handleCommission}>
                Commission
              </Button>
              <TextField
                size="small"
                label="Breakdown notes"
                value={breakdownNotes}
                onChange={(e) => setBreakdownNotes(e.target.value)}
                sx={{ minWidth: 240 }}
              />
              <Button size="small" color="error" variant="contained" onClick={handleBreakdown}>
                Report breakdown
              </Button>
            </Stack>

            <Typography variant="subtitle2" gutterBottom>
              PM schedules
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
              <TextField
                select
                size="small"
                label="Type"
                value={scheduleForm.scheduleType}
                onChange={(e) => setScheduleForm((f) => ({ ...f, scheduleType: e.target.value }))}
                sx={{ minWidth: 140 }}
              >
                {['PREVENTIVE', 'CALIBRATION', 'INSPECTION'].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Cadence"
                value={scheduleForm.cadence}
                onChange={(e) => setScheduleForm((f) => ({ ...f, cadence: e.target.value }))}
                sx={{ minWidth: 140 }}
              >
                {['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'].map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <Button size="small" variant="outlined" onClick={handleCreateSchedule}>
                Add schedule (due now)
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {schedules.length === 0
                ? 'No schedules.'
                : schedules.map((s) => `${s.scheduleType}/${s.cadence} next ${new Date(s.nextDueAt).toLocaleDateString()}`).join(' · ')}
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Tickets
            </Typography>
            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Number</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assetTickets.map((t) => (
                    <TableRow key={t.ticketId}>
                      <TableCell>{t.ticketNumber}</TableCell>
                      <TableCell>{t.ticketType}</TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>
                        {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                          <Button
                            size="small"
                            onClick={async () => {
                              try {
                                await mutations.completeTicket.mutateAsync({
                                  ticketId: t.ticketId,
                                  notes: 'Repaired / completed from UI',
                                });
                                setSnackbar({ open: true, message: 'Ticket completed', severity: 'success' });
                              } catch (e) {
                                showError(e);
                              }
                            }}
                          >
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {assetTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">
                          No tickets for this asset.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle1" gutterBottom>
              Maintenance log
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <TextField
                select
                size="small"
                label="Type"
                value={maintForm.maintenanceType}
                onChange={(e) => setMaintForm((f) => ({ ...f, maintenanceType: e.target.value }))}
                sx={{ minWidth: 160 }}
              >
                {MAINTENANCE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Notes"
                value={maintForm.notes}
                onChange={(e) => setMaintForm((f) => ({ ...f, notes: e.target.value }))}
                sx={{ minWidth: 260 }}
              />
              <Button variant="outlined" onClick={handleMaintenance} disabled={mutations.addMaintenance.isPending}>
                Log maintenance
              </Button>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maintenance.map((m) => (
                    <TableRow key={m.maintenanceId}>
                      <TableCell>{new Date(m.performedAt).toLocaleString()}</TableCell>
                      <TableCell>{m.maintenanceType}</TableCell>
                      <TableCell>{m.notes ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                  {maintenance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">
                          No maintenance logs yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Open / recent tickets (branch)
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Title</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {openTickets.slice(0, 10).map((t) => (
                  <TableRow key={t.ticketId}>
                    <TableCell>{t.ticketNumber}</TableCell>
                    <TableCell>{t.ticketType}</TableCell>
                    <TableCell>{t.status}</TableCell>
                    <TableCell>{t.title}</TableCell>
                  </TableRow>
                ))}
                {openTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        No tickets yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
