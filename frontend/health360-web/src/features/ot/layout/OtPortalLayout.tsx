import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/ot/dashboard', icon: <LocalHospitalOutlinedIcon /> },
  { section: 'Navigation', label: 'Worklist', path: '/ot/worklist', icon: <ListAltOutlinedIcon /> },
  { section: 'Navigation', label: 'Catalog', path: '/ot/catalog', icon: <Inventory2OutlinedIcon /> },
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
