import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'OPD queue', path: '/reception/dashboard', icon: <QueueOutlinedIcon /> },
  { section: 'Navigation', label: 'Patients', path: '/reception/patients/search', icon: <SearchOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/reception/settings/account', icon: <SettingsOutlinedIcon /> },
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
