import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import SettingsIcon from '@mui/icons-material/Settings';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { label: 'Medication (MAR)', path: '/nursing/dashboard', icon: <LocalPharmacyIcon /> },
  { label: 'Settings', path: '/nursing/settings/account', icon: <SettingsIcon /> },
];

export function NursingPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="NURSE"
      portalTitle="Nursing Portal"
      navItems={navItems}
    />
  );
}
