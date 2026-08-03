import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface ProfileAccordionSectionProps extends PropsWithChildren {
  id: string;
  title: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export function ProfileAccordionSection({
  id,
  title,
  expanded,
  onExpandedChange,
  children,
}: ProfileAccordionSectionProps) {
  return (
    <Accordion
      id={id}
      expanded={expanded}
      onChange={(_, isExpanded) => onExpandedChange(isExpanded)}
      TransitionProps={{ unmountOnExit: false }}
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        '&:not(:last-child)': { borderBottom: 0 },
        '&::before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
        sx={{
          minHeight: 56,
          '&.Mui-expanded': { minHeight: 56 },
          '& .MuiAccordionSummary-content': { my: 1.5 },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 3 }}>
        <motion.div
          initial={false}
          animate={{ opacity: expanded ? 1 : 0, y: expanded ? 0 : -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </AccordionDetails>
    </Accordion>
  );
}
