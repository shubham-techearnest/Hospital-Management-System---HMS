import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { MyWorkPanel } from '@/features/tasks/components/MyWorkPanel';
import { useHospitalAssociations } from '@/features/doctor/hooks/useDoctorQueries';

export function DoctorMyWorkPage() {
  const { data: associations = [], isLoading } = useHospitalAssociations();
  const active = useMemo(
    () => associations.filter((a) => a.status === 'ACTIVE' && a.hospitalId),
    [associations],
  );
  const [hospitalId, setHospitalId] = useState('');

  useEffect(() => {
    if (!hospitalId && active[0]?.hospitalId) {
      setHospitalId(active[0].hospitalId);
    }
  }, [active, hospitalId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (active.length === 0) {
    return (
      <AnimatedPage>
        <Alert severity="info">Link an active hospital association to see My Work tasks.</Alert>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Stack spacing={2}>
        {active.length > 1 ? (
          <TextField
            select
            size="small"
            label="Hospital"
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            sx={{ maxWidth: 360 }}
          >
            {active.map((a) => (
              <MenuItem key={a.id} value={a.hospitalId}>
                {a.hospitalName ?? a.hospitalId}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
        {hospitalId ? (
          <MyWorkPanel
            hospitalId={hospitalId}
            title="My Work"
            subtitle="Clinical and ops tasks for your doctor role."
          />
        ) : null}
      </Stack>
    </AnimatedPage>
  );
}
