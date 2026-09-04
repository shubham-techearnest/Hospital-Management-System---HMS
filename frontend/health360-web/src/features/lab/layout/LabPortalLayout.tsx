import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/lab/dashboard', icon: <ScienceOutlinedIcon /> },
  { section: 'Navigation', label: 'Worklist', path: '/lab/worklist', icon: <ListAltOutlinedIcon /> },
  { section: 'Navigation', label: 'Catalog', path: '/lab/catalog', icon: <Inventory2OutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/lab/settings/account', icon: <SettingsOutlinedIcon /> },
];

export function LabPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="LAB_TECHNICIAN"
      portalTitle="Lab Portal"
      navItems={navItems}
    />
  );
}
