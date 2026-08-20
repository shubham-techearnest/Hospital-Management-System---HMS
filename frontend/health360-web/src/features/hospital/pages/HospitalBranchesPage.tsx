import { useState } from 'react';
import {
  Alert, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Stack, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useCreateBranch, useDeleteBranch } from '@/features/hospital/hooks/useHospitalQueries';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { AppTable } from '@/shared/ui/AppTable';
import { useToast } from '@/shared/ui/ToastProvider';

const emptyForm = {
  name: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  latitude: '19.0760', longitude: '72.8777', phone: '', email: '', primary: false,
};

export function HospitalBranchesPage() {
  const { data: branches = [], isError, isLoading } = useBranches();
  const createBranch = useCreateBranch();
  const deleteBranch = useDeleteBranch();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleSave = async () => {
    try {
      await createBranch.mutateAsync({
        ...form,
        country: 'IN',
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        workingHours: [],
      });
      setOpen(false);
      setForm(emptyForm);
      showToast('Branch added.');
    } catch (e) {
      showToast(parseApiError(e).message, 'error');
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Branches"
        subtitle="Locations patients see in search and booking."
        actions={
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add branch
          </Button>
        }
      />
      {isError && <Alert severity="error" sx={{ mb: 2 }}>Create hospital profile first.</Alert>}

      <AppTable
        loading={isLoading}
        empty={!isLoading && branches.length === 0}
        columns={5}
        emptyIcon={<AccountTreeIcon />}
        emptyTitle="No branches yet"
        emptyDescription="Add a location so patients and staff can be scoped to a site."
        emptyActionLabel="Add branch"
        mobileCards={
          <Stack spacing={2}>
            {branches.map((branch) => (
              <Card key={branch.id} variant="outlined">
                <CardContent>
                  <Typography fontWeight={600}>{branch.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{branch.city}, {branch.state}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{branch.phone || 'No phone'}</Typography>
                  <Button
                    color="error"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={async () => {
                      try { await deleteBranch.mutateAsync(branch.id); } catch { /* noop */ }
                    }}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        }
      >
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>City</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Primary</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id} hover>
              <TableCell>{branch.name}</TableCell>
              <TableCell>{branch.city}, {branch.state}</TableCell>
              <TableCell>{branch.phone}</TableCell>
              <TableCell>{branch.primary ? 'Yes' : 'No'}</TableCell>
              <TableCell align="right">
                <IconButton
                  aria-label={`Delete ${branch.name}`}
                  onClick={async () => {
                    try { await deleteBranch.mutateAsync(branch.id); } catch { /* noop */ }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AppTable>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add branch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Address line 1" required value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="City" fullWidth value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <TextField label="State" fullWidth value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </Stack>
            <TextField label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Latitude" fullWidth value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              <TextField label="Longitude" fullWidth value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            </Stack>
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.addressLine1 || createBranch.isPending}>
            {createBranch.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
