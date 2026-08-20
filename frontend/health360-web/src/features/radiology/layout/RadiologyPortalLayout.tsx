import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/radiology/dashboard', icon: <MedicalInformationOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/radiology/settings/account', icon: <SettingsOutlinedIcon /> },
];

export function RadiologyPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="RADIOLOGY_TECHNICIAN"
      portalTitle="Radiology Portal"
      navItems={navItems}
    />
  );
}
