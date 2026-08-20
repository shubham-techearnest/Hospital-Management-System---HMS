import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/lab/dashboard', icon: <ScienceOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/lab/settings/account', icon: <SettingsOutlinedIcon /> },
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
