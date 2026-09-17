import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
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
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useCreateInventoryItem,
  useInventoryItems,
  useInventoryLocations,
  useReceiveInventoryStock,
  useStockBalances,
} from '@/features/inventory/hooks/useInventoryQueries';
import { parseApiError } from '@/shared/api/parseApiError';

const CATEGORIES = ['GENERAL', 'GLOVES', 'SYRINGE', 'REAGENT', 'LINEN', 'OTHER'] as const;

export function HospitalInventoryPage() {
  const { data: profile, isLoading: profileLoading } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const branchId = useMemo(() => branches.find((b) => b.primary)?.id ?? branches[0]?.id ?? '', [branches]);
  const hospitalId = profile?.id ?? '';

  const [tab, setTab] = useState(0);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { data: items, isLoading: itemsLoading } = useInventoryItems(hospitalId || undefined, branchId || undefined);
  const { data: balances, isLoading: balancesLoading } = useStockBalances(
    hospitalId || undefined,
    branchId || undefined,
    lowStockOnly,
  );
  const { data: locations = [] } = useInventoryLocations(hospitalId || undefined, branchId || undefined);

  const createItem = useCreateInventoryItem(hospitalId, branchId);
  const receiveStock = useReceiveInventoryStock(hospitalId, branchId);

  const [createOpen, setCreateOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [itemForm, setItemForm] = useState({
    code: '',
    name: '',
    category: 'GENERAL',
    unitOfMeasure: 'EACH',
    reorderLevel: '',
  });

  const [receiveForm, setReceiveForm] = useState({
    itemId: '',
    locationId: '',
    quantity: '10',
    lotNumber: '',
    notes: '',
  });

  if (profileLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (!hospitalId || !branchId) {
    return <Alert severity="warning">Hospital profile or branch not available.</Alert>;
  }

  const itemRows = items?.content ?? [];
  const balanceRows = balances?.content ?? [];

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Consumable inventory"
        subtitle="Track gloves, reagents, syringes, and other non-medicine stock. Medicines stay in Pharmacy."
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Catalog" />
        <Tab label="Stock board" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <Box>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              Add item
            </Button>
          </Box>
          {itemsLoading ? (
            <CircularProgress size={24} />
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">On hand</TableCell>
                    <TableCell align="right">Reorder</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell align="right">{row.quantityOnHand}</TableCell>
                      <TableCell align="right">{row.reorderLevel ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                  {itemRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography color="text.secondary">No items yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" onClick={() => setReceiveOpen(true)} disabled={itemRows.length === 0}>
              Receive stock
            </Button>
            <Chip
              label="Low stock only"
              color={lowStockOnly ? 'warning' : 'default'}
              variant={lowStockOnly ? 'filled' : 'outlined'}
              onClick={() => setLowStockOnly((v) => !v)}
            />
          </Stack>
          {balancesLoading ? (
            <CircularProgress size={24} />
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Lot</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {balanceRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.itemCode} — {row.itemName}</TableCell>
                      <TableCell>{row.locationName}</TableCell>
                      <TableCell>{row.lotNumber || '—'}</TableCell>
                      <TableCell align="right">{row.quantityOnHand}</TableCell>
                      <TableCell>
                        {row.lowStock ? <Chip size="small" color="warning" label="Low" /> : 'OK'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {balanceRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography color="text.secondary">No stock balances yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New consumable item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Code" value={itemForm.code} onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })} required />
            <TextField label="Name" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
            <TextField select label="Category" value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField label="Unit" value={itemForm.unitOfMeasure} onChange={(e) => setItemForm({ ...itemForm, unitOfMeasure: e.target.value })} />
            <TextField label="Reorder level" type="number" value={itemForm.reorderLevel} onChange={(e) => setItemForm({ ...itemForm, reorderLevel: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={createItem.isPending}
            onClick={() => {
              setFormError(null);
              void createItem
                .mutateAsync({
                  hospitalId,
                  branchId,
                  code: itemForm.code,
                  name: itemForm.name,
                  category: itemForm.category,
                  unitOfMeasure: itemForm.unitOfMeasure,
                  reorderLevel: itemForm.reorderLevel ? Number(itemForm.reorderLevel) : undefined,
                })
                .then(() => {
                  setCreateOpen(false);
                  setItemForm({ code: '', name: '', category: 'GENERAL', unitOfMeasure: 'EACH', reorderLevel: '' });
                })
                .catch((e) => setFormError(parseApiError(e).message));
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={receiveOpen} onClose={() => setReceiveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Receive stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField select label="Item" value={receiveForm.itemId} onChange={(e) => setReceiveForm({ ...receiveForm, itemId: e.target.value })} required>
              {itemRows.map((i) => (
                <MenuItem key={i.id} value={i.id}>{i.code} — {i.name}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Location" value={receiveForm.locationId} onChange={(e) => setReceiveForm({ ...receiveForm, locationId: e.target.value })} required>
              {locations.map((l) => (
                <MenuItem key={l.id} value={l.id}>{l.code} — {l.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Quantity" type="number" value={receiveForm.quantity} onChange={(e) => setReceiveForm({ ...receiveForm, quantity: e.target.value })} required />
            <TextField label="Lot (optional)" value={receiveForm.lotNumber} onChange={(e) => setReceiveForm({ ...receiveForm, lotNumber: e.target.value })} />
            <TextField label="Notes" value={receiveForm.notes} onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiveOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={receiveStock.isPending}
            onClick={() => {
              setFormError(null);
              const locId = receiveForm.locationId || locations[0]?.id;
              if (!receiveForm.itemId || !locId) {
                setFormError('Select item and location.');
                return;
              }
              void receiveStock
                .mutateAsync({
                  itemId: receiveForm.itemId,
                  locationId: locId,
                  quantity: Number(receiveForm.quantity),
                  lotNumber: receiveForm.lotNumber || undefined,
                  notes: receiveForm.notes || undefined,
                })
                .then(() => {
                  setReceiveOpen(false);
                  setReceiveForm({ itemId: '', locationId: locId, quantity: '10', lotNumber: '', notes: '' });
                })
                .catch((e) => setFormError(parseApiError(e).message));
            }}
          >
            Receive
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
