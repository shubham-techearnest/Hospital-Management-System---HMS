import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Ward board', path: '/nursing/ward', icon: <BedOutlinedIcon /> },
  { section: 'Navigation', label: 'MAR', path: '/nursing/mar', icon: <MedicationOutlinedIcon /> },
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
