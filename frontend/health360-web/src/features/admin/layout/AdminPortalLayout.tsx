import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardOutlinedIcon /> },
  { section: 'Directory', label: 'Hospitals', path: '/admin/hospitals', icon: <LocalHospitalOutlinedIcon /> },
  { section: 'Directory', label: 'Users', path: '/admin/users', icon: <PeopleOutlinedIcon /> },
  { section: 'Quality', label: 'Verifications', path: '/admin/verifications', icon: <VerifiedUserOutlinedIcon /> },
  { section: 'Quality', label: 'Reviews', path: '/admin/reviews', icon: <RateReviewOutlinedIcon /> },
  { section: 'Platform', label: 'Plans', path: '/admin/plans', icon: <CardMembershipOutlinedIcon /> },
  { section: 'Platform', label: 'Audit logs', path: '/admin/audit-logs', icon: <HistoryOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/admin/settings/account', icon: <SettingsOutlinedIcon /> },
];

export function AdminPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="PLATFORM_ADMIN"
      portalTitle="Platform Admin"
      navItems={navItems}
    />
  );
}
