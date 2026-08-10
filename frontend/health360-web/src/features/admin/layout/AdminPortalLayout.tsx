import DashboardIcon from '@mui/icons-material/Dashboard';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import SettingsIcon from '@mui/icons-material/Settings';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { label: 'Overview', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'Hospitals', path: '/admin/hospitals', icon: <LocalHospitalIcon /> },
  { label: 'Plans', path: '/admin/plans', icon: <CardMembershipIcon /> },
  { label: 'Doctor Verifications', path: '/admin/verifications', icon: <VerifiedUserIcon /> },
  { label: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
  { label: 'Review Moderation', path: '/admin/reviews', icon: <RateReviewIcon /> },
  { label: 'Settings', path: '/admin/settings/account', icon: <SettingsIcon /> },
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
