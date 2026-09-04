import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/pharmacy/dashboard', icon: <LocalPharmacyOutlinedIcon /> },
  { section: 'Navigation', label: 'Worklist', path: '/pharmacy/worklist', icon: <ListAltOutlinedIcon /> },
  { section: 'Navigation', label: 'e-Rx requests', path: '/pharmacy/requests', icon: <ShareOutlinedIcon /> },
  { section: 'Navigation', label: 'Catalog', path: '/pharmacy/catalog', icon: <Inventory2OutlinedIcon /> },
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
