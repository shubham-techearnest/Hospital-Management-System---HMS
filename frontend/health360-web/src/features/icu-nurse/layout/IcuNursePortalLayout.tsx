import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'ICU', path: '/icu-nurse/dashboard', icon: <MonitorHeartOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/icu-nurse/settings/account', icon: <SettingsOutlinedIcon /> },
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
