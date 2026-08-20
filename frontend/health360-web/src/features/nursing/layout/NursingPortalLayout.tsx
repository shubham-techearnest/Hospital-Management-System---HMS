import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Medications', path: '/nursing/dashboard', icon: <LocalPharmacyOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/nursing/settings/account', icon: <SettingsOutlinedIcon /> },
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
