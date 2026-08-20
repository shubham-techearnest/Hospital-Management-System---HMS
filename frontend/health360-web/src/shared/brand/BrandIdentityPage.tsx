import type { ReactNode } from 'react';
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Health360Logo, Health360Wordmark } from '@/shared/brand/Health360Logo';
import { Health360Mark } from '@/shared/brand/Health360Mark';
import { LogoLoader } from '@/shared/brand/LogoLoader';
import { brand } from '@/shared/brand/brand';
import { AppLayout } from '@/shared/layout/AppLayout';

function Stage({ title, children, dark = false }: { title: string; children: ReactNode; dark?: boolean }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        height: '100%',
        bgcolor: dark ? brand.colors.text : 'background.paper',
        color: dark ? brand.colors.ink : 'text.primary',
      }}
    >
      <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7, display: 'block', mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
        {children}
      </Box>
    </Paper>
  );
}

export function BrandIdentityPage() {
  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="overline" color="primary.dark" fontWeight={700} letterSpacing="0.14em">
          Brand identity
        </Typography>
        <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.03em', mb: 1 }}>
          Hospital Management System
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.75, mb: 5 }}>
          Faceted crystal shield on a white rounded tile, with a violet plus at the center. The lockup reads Hospital Management System — care, records, and operations in one place.
        </Typography>

        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Logo system</Typography>
        <Grid container spacing={2} sx={{ mb: 5 }}>
          <Grid item xs={12} md={8}>
            <Stage title="1. Primary logo — horizontal">
              <Health360Logo size={56} lockup="horizontal" />
            </Stage>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stage title="2. Symbol / mark">
              <Health360Mark size={72} />
            </Stage>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stage title="3. Wordmark">
              <Box sx={{ color: 'text.primary' }}>
                <Health360Wordmark />
              </Box>
            </Stage>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stage title="4. Horizontal logo">
              <Health360Logo size={48} lockup="horizontal" compact />
            </Stage>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stage title="5. Stacked logo">
              <Health360Logo size={64} lockup="stacked" />
            </Stage>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stage title="6. App icon">
              <Health360Mark size={88} />
            </Stage>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stage title="7. Favicon">
              <Stack direction="row" spacing={1.5} alignItems="flex-end">
                <Health360Mark size={16} simplified />
                <Health360Mark size={32} simplified />
                <Health360Mark size={48} simplified />
              </Stack>
            </Stage>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stage title="8. Light background">
              <Health360Logo size={48} lockup="horizontal" compact />
            </Stage>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stage title="9. Dark ambient" dark>
              <Health360Logo size={48} lockup="horizontal" compact wordmarkColor="#ffffff" motion="idle" />
            </Stage>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stage title="10. Navbar micro-interaction">
              <Health360Mark size={72} motion="interactive" />
            </Stage>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stage title="11. Loader shimmer">
              <Health360Mark size={88} motion="loader" />
            </Stage>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stage title="12. Loading screen">
              <Box sx={{ width: '100%' }}>
                <LogoLoader label="Preparing care workspace" size={72} />
              </Box>
            </Stage>
          </Grid>
        </Grid>

        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Color</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 5 }}>
          {Object.entries(brand.colors).map(([name, value]) => (
            <Paper key={name} variant="outlined" sx={{ p: 1.5, width: 140 }}>
              <Box sx={{ height: 48, borderRadius: 1, bgcolor: value, border: '1px solid', borderColor: 'divider', mb: 1 }} />
              <Typography variant="caption" fontWeight={700} display="block">{name}</Typography>
              <Typography variant="caption" color="text.secondary">{value}</Typography>
            </Paper>
          ))}
        </Stack>

        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Where to use each lockup</Typography>
        <Paper variant="outlined" sx={{ mb: 5, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Surface</TableCell>
                <TableCell>Lockup</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Desktop navbar', 'Horizontal logo, on-brand (white ink)'],
                ['Mobile navbar', 'Mark + HMS'],
                ['Sidebar', 'Mark only'],
                ['Login / register', 'Stacked or horizontal full logo'],
                ['Splash / boot', 'Animated mark + wordmark'],
                ['In-app loading', 'Animated mark'],
                ['Favicon / PWA', 'Simplified framed mark'],
                ['Documents', 'Horizontal full logo on light'],
                ['Marketing site', 'Primary horizontal + stacked for heroes'],
              ].map(([surface, use]) => (
                <TableRow key={surface}>
                  <TableCell>{surface}</TableCell>
                  <TableCell>{use}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Motion</Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.75, maxWidth: 720 }}>
          White rounded tile (#ffffff) with a lavender ring. Crystal facets use #714fff, #5c3dd9, and #cfc8ff so motion stays readable on the white square.
          Navbar uses a 360ms hover sweep on the highlight facet, plus scale 108% / click pulse 90%.
          Loaders run a 2s clockwise facet shimmer (deep → mid → light), then a 100ms purple snap into the header.
          Idle marks on dark (#0f0b28) keep a 3s highlight breathe and a plus glow.
        </Typography>
        <Divider sx={{ my: 4 }} />
        <Typography variant="caption" color="text.secondary">
          Personality: hospital operations, trust, clinical care. Inter wordmark. Purple primary #714fff.
        </Typography>
      </Container>
    </AppLayout>
  );
}
