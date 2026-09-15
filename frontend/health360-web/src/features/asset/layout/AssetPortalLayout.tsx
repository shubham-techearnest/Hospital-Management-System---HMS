import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Assets', path: '/assets', icon: <Inventory2OutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/assets/settings/account', icon: <SettingsOutlinedIcon /> },
];

export function AssetPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="ASSET_MANAGER"
      portalTitle="Asset Manager Portal"
      navItems={navItems}
    />
  );
}
