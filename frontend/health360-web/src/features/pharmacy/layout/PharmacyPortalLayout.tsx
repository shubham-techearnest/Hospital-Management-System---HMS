import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import SettingsIcon from '@mui/icons-material/Settings';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { label: 'Overview', path: '/pharmacy/dashboard', icon: <LocalPharmacyIcon /> },
  { label: 'Settings', path: '/pharmacy/settings/account', icon: <SettingsIcon /> },
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
