import { useState } from 'react';
import {
  Alert, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Stack, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useCreateDepartment, useDeleteDepartment, useDepartments } from '@/features/hospital/hooks/useHospitalQueries';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { AppTable } from '@/shared/ui/AppTable';
import { useToast } from '@/shared/ui/ToastProvider';

export function HospitalDepartmentsPage() {
  const { data: departments = [], isError, isLoading } = useDepartments();
  const createDept = useCreateDepartment();
  const deleteDept = useDeleteDepartment();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', floor: '' });

  const handleSave = async () => {
    try {
      await createDept.mutateAsync({ name: form.name, description: form.description, floor: form.floor, active: true });
      setOpen(false);
      setForm({ name: '', description: '', floor: '' });
      showToast('Department added.');
    } catch (e) {
      showToast(parseApiError(e).message, 'error');
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Departments"
        subtitle="Clinical units used for rostering and public profiles."
        actions={<Button variant="contained" onClick={() => setOpen(true)}>Add department</Button>}
      />
      {isError && <Alert severity="error" sx={{ mb: 2 }}>Create hospital profile first.</Alert>}

      <AppTable
        loading={isLoading}
        empty={!isLoading && departments.length === 0}
        columns={3}
        emptyIcon={<MeetingRoomIcon />}
        emptyTitle="No departments yet"
        emptyDescription="Add departments so doctors and facilities can be organized."
        emptyActionLabel="Add department"
        mobileCards={
          <Stack spacing={2}>
            {departments.map((department) => (
              <Card key={department.id} variant="outlined">
                <CardContent>
                  <Typography fontWeight={600}>{department.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{department.floor ?? 'No floor'}</Typography>
                  <Button color="error" size="small" sx={{ mt: 1 }} onClick={() => deleteDept.mutate(department.id)}>
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
            <TableCell>Floor</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id} hover>
              <TableCell>{department.name}</TableCell>
              <TableCell>{department.floor ?? '—'}</TableCell>
              <TableCell align="right">
                <IconButton aria-label={`Delete ${department.name}`} onClick={() => deleteDept.mutate(department.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AppTable>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add department</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            <TextField label="Description" multiline minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || createDept.isPending}>
            {createDept.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
