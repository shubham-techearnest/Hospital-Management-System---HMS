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
import { useInventoryItems, useInventoryLocations } from '@/features/inventory/hooks/useInventoryQueries';
import {
  useApprovePurchaseRequest,
  useCreatePurchaseOrder,
  useCreatePurchaseRequest,
  useGoodsReceipts,
  usePostGoodsReceipt,
  usePurchaseOrders,
  usePurchaseRequests,
  useRejectPurchaseRequest,
  useSubmitPurchaseRequest,
} from '@/features/procurement/hooks/useProcurementQueries';
import { parseApiError } from '@/shared/api/errorUtils';

export function HospitalProcurementPage() {
  const { data: profile, isLoading: profileLoading } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const branchId = useMemo(() => branches.find((b) => b.primary)?.id ?? branches[0]?.id ?? '', [branches]);
  const hospitalId = profile?.id ?? '';

  const [tab, setTab] = useState(0);
  const { data: prs, isLoading: prsLoading } = usePurchaseRequests(hospitalId || undefined, branchId || undefined);
  const { data: pos, isLoading: posLoading } = usePurchaseOrders(hospitalId || undefined, branchId || undefined);
  const { data: grns, isLoading: grnsLoading } = useGoodsReceipts(hospitalId || undefined, branchId || undefined);
  const { data: items } = useInventoryItems(hospitalId || undefined, branchId || undefined);
  const { data: locations = [] } = useInventoryLocations(hospitalId || undefined, branchId || undefined);

  const createPr = useCreatePurchaseRequest(hospitalId, branchId);
  const submitPr = useSubmitPurchaseRequest(hospitalId, branchId);
  const approvePr = useApprovePurchaseRequest(hospitalId, branchId);
  const rejectPr = useRejectPurchaseRequest(hospitalId, branchId);
  const createPo = useCreatePurchaseOrder(hospitalId, branchId);
  const postGrn = usePostGoodsReceipt(hospitalId, branchId);

  const [prOpen, setPrOpen] = useState(false);
  const [grnOpen, setGrnOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [prForm, setPrForm] = useState({
    title: '',
    notes: '',
    itemId: '',
    quantity: '10',
    unitPrice: '0',
  });

  const [grnForm, setGrnForm] = useState({
    purchaseOrderId: '',
    locationId: '',
    quantity: '',
  });

  if (profileLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedPo = pos?.content.find((p) => p.id === grnForm.purchaseOrderId);
  const receiveLine = selectedPo?.lines.find((l) => (l.quantityOrdered ?? 0) > (l.quantityReceived ?? 0));

  const handleCreatePr = async () => {
    setFormError(null);
    const item = items?.content.find((i) => i.id === prForm.itemId);
    if (!item) {
      setFormError('Select an inventory item');
      return;
    }
    const qty = Number(prForm.quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      setFormError('Quantity must be at least 1');
      return;
    }
    try {
      await createPr.mutateAsync({
        hospitalId,
        branchId,
        title: prForm.title.trim() || `Restock ${item.name}`,
        notes: prForm.notes.trim() || undefined,
        lines: [
          {
            inventoryItemId: item.id,
            itemCode: item.code,
            itemName: item.name,
            quantity: qty,
            unitOfMeasure: item.unitOfMeasure,
            unitPrice: Number(prForm.unitPrice) || 0,
          },
        ],
      });
      setPrOpen(false);
      setPrForm({ title: '', notes: '', itemId: '', quantity: '10', unitPrice: '0' });
    } catch (err) {
      setFormError(parseApiError(err).message);
    }
  };

  const runAction = async (fn: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(parseApiError(err).message);
    }
  };

  const handlePostGrn = async () => {
    setFormError(null);
    if (!selectedPo || !receiveLine || !grnForm.locationId) {
      setFormError('Select a purchase order with remaining qty and a location');
      return;
    }
    const qty = Number(grnForm.quantity) || receiveLine.quantityOrdered - receiveLine.quantityReceived;
    if (qty < 1) {
      setFormError('Quantity must be at least 1');
      return;
    }
    try {
      await postGrn.mutateAsync({
        purchaseOrderId: selectedPo.id,
        locationId: grnForm.locationId,
        lines: [
          {
            purchaseOrderLineId: receiveLine.id,
            quantityReceived: qty,
          },
        ],
      });
      setGrnOpen(false);
      setGrnForm({ purchaseOrderId: '', locationId: '', quantity: '' });
    } catch (err) {
      setFormError(parseApiError(err).message);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Procurement"
        subtitle="Purchase requests → orders → goods receipt into inventory"
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setPrOpen(true)}>
          New purchase request
        </Button>
        <Button variant="outlined" onClick={() => setGrnOpen(true)}>
          Post GRN
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Purchase requests" />
        <Tab label="Purchase orders" />
        <Tab label="Goods receipts" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper}>
          {prsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(prs?.content ?? []).map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell>{pr.requestNumber}</TableCell>
                    <TableCell>{pr.title}</TableCell>
                    <TableCell>
                      <Chip size="small" label={pr.status} />
                    </TableCell>
                    <TableCell align="right">{pr.totalAmount}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {pr.status === 'DRAFT' && (
                          <Button
                            size="small"
                            onClick={() => runAction(() => submitPr.mutateAsync(pr.id))}
                          >
                            Submit
                          </Button>
                        )}
                        {pr.status === 'SUBMITTED' && (
                          <>
                            <Button
                              size="small"
                              color="success"
                              onClick={() => runAction(() => approvePr.mutateAsync({ requestId: pr.id }))}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => runAction(() => rejectPr.mutateAsync({ requestId: pr.id }))}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {pr.status === 'APPROVED' && (
                          <Button
                            size="small"
                            onClick={() =>
                              runAction(() =>
                                createPo.mutateAsync({
                                  purchaseRequestId: pr.id,
                                  vendorName: 'Default Vendor',
                                }),
                              )
                            }
                          >
                            Create PO
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {(prs?.content?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">No purchase requests yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          {posLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Lines</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(pos?.content ?? []).map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>{po.orderNumber}</TableCell>
                    <TableCell>{po.vendorName ?? '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={po.status} />
                    </TableCell>
                    <TableCell align="right">{po.totalAmount}</TableCell>
                    <TableCell>
                      {po.lines
                        .map((l) => `${l.itemCode} ${l.quantityReceived}/${l.quantityOrdered}`)
                        .join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
                {(pos?.content?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">No purchase orders yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      {tab === 2 && (
        <TableContainer component={Paper}>
          {grnsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>GRN</TableCell>
                  <TableCell>PO</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Received</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(grns?.content ?? []).map((grn) => (
                  <TableRow key={grn.id}>
                    <TableCell>{grn.grnNumber}</TableCell>
                    <TableCell>{grn.purchaseOrderId.slice(0, 8)}…</TableCell>
                    <TableCell>
                      <Chip size="small" label={grn.status} />
                    </TableCell>
                    <TableCell>{new Date(grn.receivedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {(grns?.content?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary">No goods receipts yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      <Dialog open={prOpen} onClose={() => setPrOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New purchase request</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Title"
              value={prForm.title}
              onChange={(e) => setPrForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Inventory item"
              value={prForm.itemId}
              onChange={(e) => setPrForm((f) => ({ ...f, itemId: e.target.value }))}
              fullWidth
            >
              {(items?.content ?? []).map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.code} — {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantity"
              type="number"
              value={prForm.quantity}
              onChange={(e) => setPrForm((f) => ({ ...f, quantity: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Unit price"
              type="number"
              value={prForm.unitPrice}
              onChange={(e) => setPrForm((f) => ({ ...f, unitPrice: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Notes"
              value={prForm.notes}
              onChange={(e) => setPrForm((f) => ({ ...f, notes: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePr} disabled={createPr.isPending}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={grnOpen} onClose={() => setGrnOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Post goods receipt</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              select
              label="Purchase order"
              value={grnForm.purchaseOrderId}
              onChange={(e) => setGrnForm((f) => ({ ...f, purchaseOrderId: e.target.value }))}
              fullWidth
            >
              {(pos?.content ?? [])
                .filter((p) => p.status === 'ISSUED' || p.status === 'PARTIALLY_RECEIVED')
                .map((po) => (
                  <MenuItem key={po.id} value={po.id}>
                    {po.orderNumber} ({po.status})
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              select
              label="Receive into location"
              value={grnForm.locationId}
              onChange={(e) => setGrnForm((f) => ({ ...f, locationId: e.target.value }))}
              fullWidth
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.code} — {loc.name}
                </MenuItem>
              ))}
            </TextField>
            {receiveLine && (
              <Typography variant="body2" color="text.secondary">
                Receiving {receiveLine.itemCode}: remaining{' '}
                {receiveLine.quantityOrdered - receiveLine.quantityReceived}
              </Typography>
            )}
            <TextField
              label="Quantity (blank = remaining)"
              type="number"
              value={grnForm.quantity}
              onChange={(e) => setGrnForm((f) => ({ ...f, quantity: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGrnOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePostGrn} disabled={postGrn.isPending}>
            Post GRN
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
