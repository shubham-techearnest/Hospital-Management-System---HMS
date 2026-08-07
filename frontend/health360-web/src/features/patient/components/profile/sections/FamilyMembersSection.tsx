import { useState } from 'react';
import {
  Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, IconButton, List, ListItem, ListItemText, MenuItem, Skeleton, Stack, TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  useCreateFamilyMember,
  useDeleteFamilyMember,
  useFamilyMembers,
} from '../../../hooks/usePatientExtendedQueries';
import { GENDER_OPTIONS } from '../../../constants/enums';
import type { ProfileSectionCallbacks } from '../types';

interface FamilyMembersSectionProps extends ProfileSectionCallbacks {
  active: boolean;
}

export function FamilyMembersSection({ active, onSaveSuccess, onSaveError }: FamilyMembersSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', relationship: '', dateOfBirth: '', gender: '', hereditaryConditions: '', alive: true,
  });

  const { data: members = [], isLoading, isError } = useFamilyMembers(active);
  const createMember = useCreateFamilyMember();
  const deleteMember = useDeleteFamilyMember();

  const handleSave = async () => {
    try {
      await createMember.mutateAsync({
        name: form.name,
        relationship: form.relationship,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        hereditaryConditions: form.hereditaryConditions
          ? form.hereditaryConditions.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        alive: form.alive,
      });
      setDialogOpen(false);
      setForm({ name: '', relationship: '', dateOfBirth: '', gender: '', hereditaryConditions: '', alive: true });
      onSaveSuccess('Family member added.');
    } catch {
      onSaveError('Unable to save family member.');
    }
  };

  if (active && isLoading) return <Skeleton variant="rounded" height={180} />;
  if (isError) return <Alert severity="error">Unable to load family members.</Alert>;

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setDialogOpen(true)}>Add member</Button>
      </Stack>
      {members.length === 0 ? (
        <Alert severity="info">No family members recorded yet.</Alert>
      ) : (
        <List dense>
          {members.map((m) => (
            <ListItem
              key={m.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => deleteMember.mutateAsync(m.id).then(() => onSaveSuccess('Removed.')).catch(() => onSaveError('Delete failed.'))}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${m.name} (${m.relationship})`}
                secondary={[
                  m.dateOfBirth ? `DOB: ${m.dateOfBirth}` : null,
                  m.hereditaryConditions.length > 0 ? `Conditions: ${m.hereditaryConditions.join(', ')}` : null,
                  !m.alive ? 'Deceased' : null,
                ].filter(Boolean).join(' · ')}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add family member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" required fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Relationship" required fullWidth value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
            <TextField label="Date of birth" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            <TextField
              select
              label="Gender"
              fullWidth
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <MenuItem value="">Select</MenuItem>
              {GENDER_OPTIONS.map((g) => (
                <MenuItem key={g} value={g}>{g.replace(/_/g, ' ')}</MenuItem>
              ))}
            </TextField>
            <TextField label="Hereditary conditions (comma-separated)" fullWidth value={form.hereditaryConditions} onChange={(e) => setForm({ ...form, hereditaryConditions: e.target.value })} />
            <FormControlLabel control={<Checkbox checked={form.alive} onChange={(e) => setForm({ ...form, alive: e.target.checked })} />} label="Living" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.relationship || createMember.isPending}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
