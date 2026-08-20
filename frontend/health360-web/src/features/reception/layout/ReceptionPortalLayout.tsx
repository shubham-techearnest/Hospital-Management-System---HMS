import SearchIcon from '@mui/icons-material/Search';
import QueueIcon from '@mui/icons-material/Queue';
import SettingsIcon from '@mui/icons-material/Settings';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { label: 'OPD Queue', path: '/reception/dashboard', icon: <QueueIcon /> },
  { label: 'Patient Search', path: '/reception/patients/search', icon: <SearchIcon /> },
  { label: 'Settings', path: '/reception/settings/account', icon: <SettingsIcon /> },
];

export function ReceptionPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="RECEPTIONIST"
      portalTitle="Reception Portal"
      navItems={navItems}
    />
  );
}
