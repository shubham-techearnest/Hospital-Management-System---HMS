import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { label: 'Overview', path: '/lab/dashboard', icon: <ScienceIcon /> },
  { label: 'Settings', path: '/lab/settings/account', icon: <SettingsIcon /> },
];

export function LabPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="LAB_TECHNICIAN"
      portalTitle="Lab Portal"
      navItems={navItems}
    />
  );
}
