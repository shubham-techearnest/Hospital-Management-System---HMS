import { Box, Paper, Table, TableContainer, useMediaQuery, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ListSkeleton, TableSkeleton } from '@/shared/ui/skeletons';

interface AppTableProps {
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyTo?: string;
  emptyIcon?: ReactNode;
  columns?: number;
  mobileCards?: ReactNode;
  caption?: string;
}

export function AppTable({
  children,
  loading,
  empty,
  emptyTitle = 'Nothing to show yet',
  emptyDescription,
  emptyActionLabel,
  emptyTo,
  emptyIcon,
  columns = 5,
  mobileCards,
  caption,
}: AppTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return isMobile && mobileCards ? <ListSkeleton /> : <TableSkeleton columns={columns} />;
  }

  if (empty) {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          to={emptyTo}
        />
      </Paper>
    );
  }

  if (isMobile && mobileCards) {
    return <Box>{mobileCards}</Box>;
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        overflowX: 'auto',
        maxWidth: '100%',
        '& .MuiTableHead-root .MuiTableCell-root': {
          fontWeight: 600,
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        },
      }}
    >
      {caption ? (
        <Box component="div" sx={{ px: 2, pt: 1.5, fontSize: 13, color: 'text.secondary' }}>
          {caption}
        </Box>
      ) : null}
      <Table size="medium">{children}</Table>
    </TableContainer>
  );
}
