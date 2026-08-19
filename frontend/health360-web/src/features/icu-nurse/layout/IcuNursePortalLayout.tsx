import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import SettingsIcon from '@mui/icons-material/Settings';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { label: 'ICU Dashboard', path: '/icu-nurse/dashboard', icon: <MonitorHeartIcon /> },
  { label: 'Settings', path: '/icu-nurse/settings/account', icon: <SettingsIcon /> },
];

export function IcuNursePortalLayout() {
  return (
    <PortalShellLayout
      portalRole="ICU_NURSE"
      portalTitle="ICU Nursing Portal"
      navItems={navItems}
    />
  );
}
