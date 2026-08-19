import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SettingsIcon from '@mui/icons-material/Settings';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { label: 'Overview', path: '/ot/dashboard', icon: <LocalHospitalIcon /> },
  { label: 'Settings', path: '/ot/settings/account', icon: <SettingsIcon /> },
];

export function OtPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="OT_COORDINATOR"
      portalTitle="Operation Theatre Portal"
      navItems={navItems}
    />
  );
}
