import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/ot/dashboard', icon: <LocalHospitalOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/ot/settings/account', icon: <SettingsOutlinedIcon /> },
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
