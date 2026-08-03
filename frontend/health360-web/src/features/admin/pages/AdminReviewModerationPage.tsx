import { useState } from 'react';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Paper, Select, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useAdminReviews, useModerateReview } from '../hooks/useAdminExtendedQueries';
import type { AdminReview } from '../api/adminUserApi';

export function AdminReviewModerationPage() {
  const [status, setStatus] = useState('visible');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AdminReview | null>(null);
  const [action, setAction] = useState<'HIDE' | 'REMOVE'>('HIDE');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useAdminReviews(status, page);
  const moderate = useModerateReview();

  const handleModerate = async () => {
    if (!selected || !reason.trim()) return;
    setMessage(null);
    try {
      await moderate.mutateAsync({ reviewId: selected.id, action, reason: reason.trim() });
      setSelected(null);
      setReason('');
      setMessage('Review moderated successfully.');
    } catch {
      setMessage('Moderation failed.');
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Review Moderation</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Hide or remove inappropriate doctor and hospital reviews.
      </Typography>

      <FormControl size="small" sx={{ minWidth: 160, mb: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
          <MenuItem value="visible">Visible</MenuItem>
          <MenuItem value="hidden">Hidden</MenuItem>
        </Select>
      </FormControl>

      {message ? <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load reviews.</Alert> : null}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5}>Loading…</TableCell></TableRow>}
            {!isLoading && (data?.content ?? []).length === 0 && (
              <TableRow><TableCell colSpan={5}>No reviews found.</TableCell></TableRow>
            )}
            {(data?.content ?? []).map((review) => (
              <TableRow key={review.id} hover>
                <TableCell>
                  <Chip size="small" label={review.reviewType.replace(/_/g, ' ')} />
                </TableCell>
                <TableCell>{review.rating} ★</TableCell>
                <TableCell sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {review.comment ?? '—'}
                </TableCell>
                <TableCell>{new Date(review.createdAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  {status === 'visible' ? (
                    <Button size="small" variant="outlined" onClick={() => { setSelected(review); setAction('HIDE'); setReason(''); }}>
                      Moderate
                    </Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">Hidden</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data && data.totalPages > 1 ? (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Moderate review</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select label="Action" value={action} onChange={(e) => setAction(e.target.value as 'HIDE' | 'REMOVE')}>
                <MenuItem value="HIDE">Hide (keep in database)</MenuItem>
                <MenuItem value="REMOVE">Remove permanently</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Reason" required multiline minRows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleModerate} disabled={!reason.trim() || moderate.isPending}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
