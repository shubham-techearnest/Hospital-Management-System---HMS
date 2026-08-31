import { type ReactElement, type ReactNode } from 'react';
import { Badge, Box, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { OpdChecklistStep, OpdChecklistStepId } from '@/features/clinical/utils/opdVisitChecklist';

export type DoctorEncounterTabId = 'patient' | OpdChecklistStepId | 'done';

function tabIcon(icon: ReactElement, showBadge: boolean): ReactElement {
  if (!showBadge) return icon;
  return <Badge color="warning" variant="dot">{icon}</Badge>;
}

const TAB_META: Array<{
  id: DoctorEncounterTabId;
  label: string;
  icon: ReactElement;
  checklistId?: OpdChecklistStepId;
}> = [
  { id: 'patient', label: 'Patient', icon: <PersonOutlineIcon /> },
  { id: 'vitals', label: 'Vitals', icon: <MonitorHeartOutlinedIcon />, checklistId: 'vitals' },
  { id: 'consult', label: 'Consult', icon: <DescriptionOutlinedIcon />, checklistId: 'consult' },
  { id: 'rx', label: 'Rx', icon: <MedicationOutlinedIcon />, checklistId: 'rx' },
  { id: 'labs', label: 'Orders', icon: <ScienceOutlinedIcon />, checklistId: 'labs' },
  { id: 'done', label: 'Done', icon: <CheckCircleOutlineIcon /> },
];

type Props = {
  value: DoctorEncounterTabId;
  onChange: (tab: DoctorEncounterTabId) => void;
  steps: OpdChecklistStep[];
  children: ReactNode;
};

function stepForTab(tabId: DoctorEncounterTabId, steps: OpdChecklistStep[]): OpdChecklistStep | undefined {
  const meta = TAB_META.find((t) => t.id === tabId);
  if (!meta?.checklistId) return undefined;
  return steps.find((s) => s.id === meta.checklistId);
}

export function DoctorEncounterFingerTabs({ value, onChange, steps, children }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: { xs: 'calc(100dvh - 120px)', md: 'auto' } }}>
      {!isMobile ? (
        <Tabs
          value={value}
          onChange={(_, v) => onChange(v as DoctorEncounterTabId)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600 },
          }}
        >
          {TAB_META.map((tab) => {
            const step = stepForTab(tab.id, steps);
            const showBadge = step?.required && !step.done;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                icon={tabIcon(tab.icon, Boolean(showBadge))}
                iconPosition="start"
                label={tab.label}
              />
            );
          })}
        </Tabs>
      ) : null}

      <Box sx={{ flex: 1, overflow: 'auto', pb: isMobile ? 10 : 0 }}>
        {children}
      </Box>

      {isMobile ? (
        <Tabs
          value={value}
          onChange={(_, v) => onChange(v as DoctorEncounterTabId)}
          variant="fullWidth"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            minHeight: 64,
            '& .MuiTab-root': {
              minHeight: 64,
              minWidth: 0,
              px: 0.5,
              fontSize: '0.7rem',
              textTransform: 'none',
            },
            '& .MuiTab-iconWrapper': { mb: 0.25 },
          }}
        >
          {TAB_META.map((tab) => {
            const step = stepForTab(tab.id, steps);
            const showBadge = step?.required && !step.done;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                icon={tabIcon(tab.icon, Boolean(showBadge))}
                label={tab.label}
              />
            );
          })}
        </Tabs>
      ) : null}
    </Box>
  );
}

export function checklistStepToTab(stepId: OpdChecklistStepId): DoctorEncounterTabId {
  if (stepId === 'diagnosis') return 'consult';
  if (stepId === 'billing') return 'done';
  return stepId;
}
