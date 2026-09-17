import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { WorkItem } from '../api/tasksApi';
import { useMyWork, useMyWorkSummary, useUpdateWorkItemStatus } from '../hooks/useTaskQueries';

const QUEUES: { value: string; label: string; key: keyof NonNullable<ReturnType<typeof useMyWorkSummary>['data']> | null }[] = [
  { value: '', label: 'All open', key: 'openTotal' },
  { value: 'URGENT', label: 'Urgent', key: 'urgent' },
  { value: 'TODAY', label: 'Today', key: 'today' },
  { value: 'OVERDUE', label: 'Overdue', key: 'overdue' },
  { value: 'PENDING', label: 'Pending', key: 'pending' },
];

function priorityColor(priority: string): 'default' | 'info' | 'warning' | 'error' {
  switch (priority) {
    case 'URGENT':
      return 'error';
    case 'HIGH':
      return 'warning';
    case 'LOW':
      return 'default';
    default:
      return 'info';
  }
}

function formatWhen(value?: string) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

interface MyWorkPanelProps {
  hospitalId: string;
  title?: string;
  subtitle?: string;
}

export function MyWorkPanel({
  hospitalId,
  title = 'My Work',
  subtitle = 'Clear your shift from one queue — urgent, due today, overdue, and pending.',
}: MyWorkPanelProps) {
  const [queue, setQueue] = useState('');
  const { data: summary } = useMyWorkSummary(hospitalId || undefined);
  const { data, isLoading, isError, error, refetch } = useMyWork(
    hospitalId,
    undefined,
    queue || 'ALL',
  );
  const updateStatus = useUpdateWorkItemStatus(hospitalId);

  const rows = useMemo(() => data?.content ?? [], [data?.content]);

  const act = async (item: WorkItem, next: string) => {
    await updateStatus.mutateAsync({ taskId: item.id, status: next });
  };

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {QUEUES.map((q) => {
          const count = q.key && summary ? summary[q.key] : undefined;
          const selected = queue === q.value || (q.value === '' && queue === '');
          return (
            <Chip
              key={q.label}
              clickable
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              label={count != null ? `${q.label} (${count})` : q.label}
              onClick={() => setQueue(q.value)}
            />
          );
        })}
      </Stack>

      {isLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : null}

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {(error as Error)?.message || 'Failed to load tasks'}
        </Alert>
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <Alert severity="info">No tasks in this queue right now.</Alert>
      ) : null}

      {rows.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.title}
                    </Typography>
                    {item.description ? (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.description}
                      </Typography>
                    ) : null}
                    {item.assignedRole ? (
                      <Typography variant="caption" color="text.secondary">
                        Queue: {item.assignedRole}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{item.taskType}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={item.priority} color={priorityColor(item.priority)} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={item.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatWhen(item.dueAt)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {item.status === 'PENDING' || item.status === 'ASSIGNED' ? (
                        <Button
                          size="small"
                          disabled={updateStatus.isPending}
                          onClick={() => void act(item, 'IN_PROGRESS')}
                        >
                          Start
                        </Button>
                      ) : null}
                      {item.status === 'IN_PROGRESS' ||
                      item.status === 'ASSIGNED' ||
                      item.status === 'PENDING' ? (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={updateStatus.isPending}
                          onClick={() => void act(item, 'COMPLETED')}
                        >
                          Done
                        </Button>
                      ) : null}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Stack>
  );
}
