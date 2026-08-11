import { useState } from 'react';
import {
  Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useAdminAuditLogs } from '../hooks/useAdminHospitalQueries';

export function AdminAuditLogsPage() {
  const [actionFilter, setActionFilter] = useState('');
  const { data, isError, error } = useAdminAuditLogs({ action: actionFilter || undefined, page: 0, size: 50 });
  const loadError = isError ? parseApiError(error) : null;

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Audit Logs</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Platform activity audit trail (most recent first).
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError.message}</Alert>}

      <TextField
        label="Filter by action"
        size="small"
        value={actionFilter}
        onChange={(e) => setActionFilter(e.target.value)}
        sx={{ mb: 2, minWidth: 280 }}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.content ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{new Date(row.occurredAt).toLocaleString()}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell>{row.entityType} / {row.entityId.slice(0, 8)}…</TableCell>
                <TableCell>{row.userId?.slice(0, 8) ?? '—'}…</TableCell>
              </TableRow>
            ))}
            {(data?.content?.length ?? 0) === 0 && (
              <TableRow><TableCell colSpan={4}>No audit entries found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </AnimatedPage>
  );
}
