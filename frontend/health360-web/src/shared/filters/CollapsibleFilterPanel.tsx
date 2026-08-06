import { useState, type ReactNode } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material';

interface CollapsibleFilterPanelProps {
  /** Always-visible primary filters */
  primary: ReactNode;
  /** Extra filters shown when expanded */
  advanced?: ReactNode;
  advancedLabel?: string;
  sx?: object;
}

/** Keeps search pages compact — primary filters visible, advanced collapsed by default */
export function CollapsibleFilterPanel({
  primary,
  advanced,
  advancedLabel = 'More filters',
  sx,
}: CollapsibleFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Stack spacing={1.5} sx={{ mb: 2, maxWidth: 720, ...sx }}>
      {primary}
      {advanced ? (
        <Accordion
          expanded={expanded}
          onChange={(_, open) => setExpanded(open)}
          disableGutters
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            '&:before': { display: 'none' },
            bgcolor: 'background.paper',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, py: 0 }}>
            <Typography variant="body2" fontWeight={600}>{advancedLabel}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {advanced}
            </Box>
          </AccordionDetails>
        </Accordion>
      ) : null}
    </Stack>
  );
}
