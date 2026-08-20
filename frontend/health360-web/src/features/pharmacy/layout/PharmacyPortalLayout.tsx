import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/pharmacy/dashboard', icon: <LocalPharmacyOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/pharmacy/settings/account', icon: <SettingsOutlinedIcon /> },
];

export function PharmacyPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="PHARMACIST"
      portalTitle="Pharmacy Portal"
      navItems={navItems}
    />
  );
}
