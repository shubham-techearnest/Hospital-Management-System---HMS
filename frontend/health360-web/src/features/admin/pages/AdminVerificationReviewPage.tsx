import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import {
  useApproveVerification,
  useFetchVerificationDocument,
  useRejectVerification,
  useVerificationReview,
} from '@/features/admin/hooks/useAdminDoctorQueries';

export function AdminVerificationReviewPage() {
  const { doctorId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useVerificationReview(doctorId);
  const approve = useApproveVerification();
  const reject = useRejectVerification();
  const fetchDoc = useFetchVerificationDocument();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleViewDoc = async (documentId: string, contentType: string) => {
    try {
      const blob = await fetchDoc.mutateAsync({ doctorId, documentId });
      const url = URL.createObjectURL(new Blob([blob], { type: contentType }));
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setSnackbar({ open: true, message: 'Unable to open document.', severity: 'error' });
    }
  };

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(doctorId);
      setSnackbar({ open: true, message: 'Doctor verified.', severity: 'success' });
      navigate('/admin/verifications');
    } catch {
      setSnackbar({ open: true, message: 'Unable to approve.', severity: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      await reject.mutateAsync({ doctorId, reason });
      setRejectOpen(false);
      setReason('');
      setSnackbar({ open: true, message: 'Verification rejected.', severity: 'success' });
      navigate('/admin/verifications');
    } catch {
      setSnackbar({ open: true, message: 'Unable to reject.', severity: 'error' });
    }
  };

  if (isLoading) return <Typography>Loading…</Typography>;
  if (isError || !data) return <Alert severity="error">Unable to load review details.</Alert>;

  const profile = data.profile;

  return (
    <AnimatedPage>
      <Button component={RouterLink} to="/admin/verifications" sx={{ mb: 2 }}>← Back to queue</Button>
      <Typography variant="h4" fontWeight={700} mb={1}>{data.doctorName}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{data.email}</Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Profile summary</Typography>
        <Stack spacing={1}>
          <Typography variant="body2">Registration: {profile.professionalDetails.medicalRegistrationNumber ?? '—'}</Typography>
          <Typography variant="body2">Council: {profile.professionalDetails.registrationCouncil ?? '—'}</Typography>
          <Typography variant="body2">Specialization: {profile.specialization?.primarySpecializationName ?? '—'}</Typography>
          <Typography variant="body2">Qualifications: {profile.qualifications.length}</Typography>
          <Typography variant="body2">Languages: {profile.languages?.join(', ') || '—'}</Typography>
          <Typography variant="body2">Status: {data.verificationStatus.replace(/_/g, ' ')}</Typography>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Verification documents</Typography>
        <Stack spacing={1}>
          {data.documents.map((doc) => (
            <Box key={doc.id} display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {doc.documentType.replace(/_/g, ' ')} — {doc.fileName}
              </Typography>
              <Button size="small" onClick={() => handleViewDoc(doc.id, doc.contentType)}>
                View
              </Button>
            </Box>
          ))}
          {data.documents.length === 0 && <Typography variant="body2" color="text.secondary">No documents.</Typography>}
        </Stack>
      </Paper>

      {data.verificationStatus === 'PENDING_VERIFICATION' && (
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="success" onClick={handleApprove} disabled={approve.isPending}>
            Approve
          </Button>
          <Button variant="outlined" color="error" onClick={() => setRejectOpen(true)} disabled={reject.isPending}>
            Reject
          </Button>
        </Stack>
      )}

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject verification</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason (required)"
            multiline
            minRows={3}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={!reason.trim()} onClick={handleReject}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
