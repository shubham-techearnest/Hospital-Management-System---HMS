import { Box, Card, CardContent, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export function CardSkeleton({ height = 120 }: { height?: number }) {
  return <Skeleton variant="rounded" height={height} sx={{ borderRadius: 2 }} />;
}

export function DashboardSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <Stack spacing={3} role="status" aria-label="Loading dashboard">
      <Box>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="60%" height={24} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {Array.from({ length: cards }).map((_, index) => (
          <CardSkeleton key={index} height={96} />
        ))}
      </Box>
      <CardSkeleton height={220} />
    </Stack>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Stack spacing={1.5} role="status" aria-label="Loading list">
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index} variant="outlined">
          <CardContent>
            <Skeleton width="50%" />
            <Skeleton width="80%" />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <TableContainer component={Paper} variant="outlined" role="status" aria-label="Loading table">
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableCell key={index}><Skeleton width="70%" /></TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, row) => (
            <TableRow key={row}>
              {Array.from({ length: columns }).map((_, col) => (
                <TableCell key={col}><Skeleton /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ProfileSkeleton() {
  return (
    <Stack spacing={2} role="status" aria-label="Loading profile">
      <Skeleton variant="text" width="35%" height={40} />
      <Skeleton variant="rounded" height={72} />
      <Skeleton variant="rounded" height={220} />
    </Stack>
  );
}
