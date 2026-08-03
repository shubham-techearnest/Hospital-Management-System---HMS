import { Typography } from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <AnimatedPage>
      <Typography variant="h4" sx={{ mb: 1 }}>{title}</Typography>
      <Typography color="text.secondary">This section is planned for a future sprint.</Typography>
    </AnimatedPage>
  );
}
