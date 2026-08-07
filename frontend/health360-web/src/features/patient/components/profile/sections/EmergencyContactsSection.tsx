import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  useCreateEmergencyContact,
  useDeleteEmergencyContact,
  useEmergencyContacts,
} from '../../../hooks/usePatientQueries';
import { isValidEmail, sanitizeOptionalEmail } from '../../../utils/profileEnumMapper';
import type { ProfileSectionCallbacks } from '../types';

interface EmergencyContactsSectionProps extends ProfileSectionCallbacks {
  active: boolean;
}

export function EmergencyContactsSection({ active, onSaveSuccess, onSaveError }: EmergencyContactsSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', email: '', primary: false });
  const [emailError, setEmailError] = useState<string | null>(null);

  const { data: contacts = [], isLoading, isError } = useEmergencyContacts(active);
  const createContact = useCreateEmergencyContact();
  const deleteContact = useDeleteEmergencyContact();

  const handleSave = async () => {
    setError(null);
    setEmailError(null);
    const trimmedEmail = form.email.trim();
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setEmailError('Enter a valid email address or leave blank.');
      return;
    }
    try {
      await createContact.mutateAsync({
        name: form.name,
        relationship: form.relationship,
        phone: form.phone,
        email: sanitizeOptionalEmail(form.email),
        primary: form.primary,
      });
      setDialogOpen(false);
      setForm({ name: '', relationship: '', phone: '', email: '', primary: false });
      onSaveSuccess('Emergency contact added.');
    } catch {
      setError('Unable to save contact. Maximum 5 contacts allowed.');
      onSaveError('Unable to save contact.');
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteContact.mutateAsync(id);
      onSaveSuccess('Emergency contact removed.');
    } catch {
      setError('Unable to delete contact.');
      onSaveError('Unable to delete contact.');
    }
  };

  if (active && isLoading) {
    return <Skeleton variant="rounded" height={180} />;
  }

  if (isError) {
    return <Alert severity="error">Unable to load emergency contacts.</Alert>;
  }

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setDialogOpen(true)} sx={{ mb: 2 }}>
        Add Contact
      </Button>
      <List disablePadding>
        {contacts.map((c) => (
          <ListItem
            key={c.id}
            divider
            secondaryAction={
              <IconButton edge="end" aria-label="Delete contact" onClick={() => handleDelete(c.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${c.name}${c.primary ? ' (Primary)' : ''}`}
              secondary={`${c.relationship} · ${c.phone}${c.email ? ` · ${c.email}` : ''}`}
            />
          </ListItem>
        ))}
        {contacts.length === 0 && (
          <ListItem><ListItemText primary="No emergency contacts yet." /></ListItem>
        )}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Emergency Contact</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Relationship" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setEmailError(null);
              }}
              error={!!emailError}
              helperText={emailError ?? 'Optional'}
            />
            <FormControlLabel
              control={<Checkbox checked={form.primary} onChange={(e) => setForm({ ...form, primary: e.target.checked })} />}
              label="Primary contact"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.relationship || !form.phone}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
