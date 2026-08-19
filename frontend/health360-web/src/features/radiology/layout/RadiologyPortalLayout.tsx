import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import SettingsIcon from '@mui/icons-material/Settings';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { label: 'Overview', path: '/radiology/dashboard', icon: <MedicalInformationIcon /> },
  { label: 'Settings', path: '/radiology/settings/account', icon: <SettingsIcon /> },
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
