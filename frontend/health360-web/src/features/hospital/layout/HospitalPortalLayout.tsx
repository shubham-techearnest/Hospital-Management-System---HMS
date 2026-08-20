import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import EmergencyOutlinedIcon from '@mui/icons-material/EmergencyOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';

const navItems: PortalNavItem[] = [
  { label: 'Overview', path: '/hospital/dashboard', icon: <DashboardOutlinedIcon /> },
  { section: 'Clinical', label: 'OPD', path: '/hospital/opd', icon: <QueueOutlinedIcon /> },
  { section: 'Clinical', label: 'IPD', path: '/hospital/ipd', icon: <HotelOutlinedIcon /> },
  { section: 'Clinical', label: 'ICU', path: '/hospital/icu', icon: <MonitorHeartOutlinedIcon /> },
  { section: 'Clinical', label: 'Laboratory', path: '/hospital/lab', icon: <ScienceOutlinedIcon /> },
  { section: 'Clinical', label: 'Radiology', path: '/hospital/radiology', icon: <MedicalInformationOutlinedIcon /> },
  { section: 'Clinical', label: 'Theatre', path: '/hospital/ot', icon: <HealingOutlinedIcon /> },
  { section: 'Clinical', label: 'Pharmacy', path: '/hospital/pharmacy', icon: <LocalPharmacyOutlinedIcon /> },
  { section: 'Navigation', label: 'Profile', path: '/hospital/profile', icon: <LocalHospitalOutlinedIcon /> },
  { section: 'Navigation', label: 'Branches', path: '/hospital/branches', icon: <AccountTreeOutlinedIcon /> },
  { section: 'Navigation', label: 'Departments', path: '/hospital/departments', icon: <MeetingRoomOutlinedIcon /> },
  { section: 'Navigation', label: 'Emergency', path: '/hospital/emergency', icon: <EmergencyOutlinedIcon /> },
  { section: 'Navigation', label: 'Facilities', path: '/hospital/facilities', icon: <MedicalServicesOutlinedIcon /> },
  { section: 'Navigation', label: 'Gallery', path: '/hospital/gallery', icon: <PhotoLibraryOutlinedIcon /> },
  { section: 'Navigation', label: 'Plan', path: '/hospital/subscription', icon: <CardMembershipOutlinedIcon /> },
  { section: 'People', label: 'Doctors', path: '/hospital/doctors', icon: <GroupsOutlinedIcon /> },
  { section: 'People', label: 'Staff', path: '/hospital/staff', icon: <BadgeOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/hospital/settings/account', icon: <SettingsOutlinedIcon /> },
];

export function HospitalPortalLayout() {
  return (
    <PortalShellLayout
      portalRole="HOSPITAL_ADMIN"
      portalTitle="Hospital Portal"
      navItems={navItems}
    />
  );
}
