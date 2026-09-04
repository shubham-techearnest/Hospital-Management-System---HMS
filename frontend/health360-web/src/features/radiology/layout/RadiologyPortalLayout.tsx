import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/radiology/dashboard', icon: <MedicalInformationOutlinedIcon /> },
  { section: 'Navigation', label: 'Worklist', path: '/radiology/worklist', icon: <ListAltOutlinedIcon /> },
  { section: 'Navigation', label: 'Catalog', path: '/radiology/catalog', icon: <Inventory2OutlinedIcon /> },
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
