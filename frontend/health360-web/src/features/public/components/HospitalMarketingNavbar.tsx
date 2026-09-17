import { Link as RouterLink } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import BloodtypeOutlinedIcon from '@mui/icons-material/BloodtypeOutlined';
import AirOutlinedIcon from '@mui/icons-material/Air';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import PregnantWomanOutlinedIcon from '@mui/icons-material/PregnantWomanOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { brand } from '@/shared/brand/brand';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { APP_NAVBAR_HEIGHT } from '@/shared/layout/PortalTopBar';

type MegaItem = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
};

type MegaColumn = {
  heading: string;
  items: MegaItem[];
};

type MegaMenuDef = {
  id: string;
  label: string;
  columns: MegaColumn[];
  footerNote: string;
};

const MENUS: MegaMenuDef[] = [
  {
    id: 'products',
    label: 'Products',
    footerNote: 'Have a look at our one-stop digital healthcare solution',
    columns: [
      {
        heading: 'Clinical & ops',
        items: [
          { title: 'OPD & IPD', description: 'Queues, admissions, beds, and discharge in one flow', href: '#hospital-modules', icon: <EventAvailableOutlinedIcon fontSize="small" /> },
          { title: 'EMR / records', description: 'Visit history shared across authorized roles', href: '#hospital-modules', icon: <MonitorHeartOutlinedIcon fontSize="small" /> },
          { title: 'Pharmacy', description: 'Role-scoped dispense tied to the patient record', href: '#hospital-modules', icon: <LocalPharmacyOutlinedIcon fontSize="small" /> },
        ],
      },
      {
        heading: 'Diagnostics & finance',
        items: [
          { title: 'Laboratory', description: 'Lab and radiology queues back into the care record', href: '#hospital-modules', icon: <ScienceOutlinedIcon fontSize="small" /> },
          { title: 'Billing', description: 'OPD/IPD invoices beside the clinical visit', href: '#hospital-modules', icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
          { title: 'Staff portals', description: 'Reception, nursing, OT, lab, pharmacy invites', href: '#hospital-modules', icon: <GroupsOutlinedIcon fontSize="small" /> },
        ],
      },
    ],
  },
  {
    id: 'speciality',
    label: 'Speciality',
    footerNote: 'Built for multi-speciality hospitals and focused clinics',
    columns: [
      {
        heading: 'Specialists',
        items: [
          { title: 'Cardiology', description: 'Heart and vessel care workflows', href: '#demo', icon: <FavoriteBorderIcon fontSize="small" /> },
          { title: 'Orthopedics', description: 'Musculoskeletal clinics and OT coordination', href: '#demo', icon: <AccessibilityNewOutlinedIcon fontSize="small" /> },
          { title: 'Gastroenterology', description: 'GI practice from OPD to procedures', href: '#demo', icon: <HealingOutlinedIcon fontSize="small" /> },
          { title: 'Pulmonology', description: 'Respiratory clinics and follow-ups', href: '#demo', icon: <AirOutlinedIcon fontSize="small" /> },
          { title: 'Nephrology', description: 'Kidney care and dialysis-ready ops', href: '#demo', icon: <BloodtypeOutlinedIcon fontSize="small" /> },
          { title: 'Oncology', description: 'Integrated cancer care documentation', href: '#demo', icon: <MedicalServicesOutlinedIcon fontSize="small" /> },
          { title: 'Neurology', description: 'Brain, spine, and nerve disease workflows', href: '#demo', icon: <PsychologyOutlinedIcon fontSize="small" /> },
          { title: 'Ophthalmology', description: 'Vision clinics and procedure tracking', href: '#demo', icon: <VisibilityOutlinedIcon fontSize="small" /> },
        ],
      },
      {
        heading: 'Primary',
        items: [
          { title: 'General medicine', description: 'High-volume OPD and chronic care', href: '#demo', icon: <MedicalServicesOutlinedIcon fontSize="small" /> },
          { title: 'Pediatrics', description: 'Growth, visits, and family follow-up', href: '#demo', icon: <ChildCareOutlinedIcon fontSize="small" /> },
          { title: 'Gynecology', description: 'Pregnancy and women’s health journeys', href: '#demo', icon: <PregnantWomanOutlinedIcon fontSize="small" /> },
        ],
      },
      {
        heading: 'Allied',
        items: [
          { title: 'Laboratory', description: 'Pathology and sample-to-report flows', href: '#hospital-modules', icon: <ScienceOutlinedIcon fontSize="small" /> },
          { title: 'Pharmacy', description: 'Dispense and inventory beside care', href: '#hospital-modules', icon: <LocalPharmacyOutlinedIcon fontSize="small" /> },
        ],
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    footerNote: 'Learn how hospitals and users stay connected on one platform',
    columns: [
      {
        heading: 'Why hospitals choose us',
        items: [
          { title: 'Why this platform', description: 'Users and hospitals share one identity', href: '#hospital-why', icon: <Diversity3OutlinedIcon fontSize="small" /> },
          { title: 'Security', description: 'Role-scoped access and private records', href: '#hospital-security', icon: <SecurityOutlinedIcon fontSize="small" /> },
          { title: 'FAQ', description: 'Provisioning, staff invites, and demos', href: '#hospital-faq', icon: <HelpOutlineIcon fontSize="small" /> },
        ],
      },
      {
        heading: 'Get started',
        items: [
          { title: 'Book a demo', description: 'Platform admins review every hospital request', href: '#demo', icon: <EventAvailableOutlinedIcon fontSize="small" /> },
          { title: 'User signup', description: 'Users self-register for care search and OPD', href: '/register', icon: <PersonOutlineIcon fontSize="small" /> },
          { title: 'Doctor access', description: 'Doctors request provisioning separately', href: '/request-access?type=DOCTOR', icon: <MedicalServicesOutlinedIcon fontSize="small" /> },
        ],
      },
    ],
  },
];

function MegaItemRow({ item, onNavigate }: { item: MegaItem; onNavigate: () => void }) {
  const isHash = item.href.startsWith('#');
  const sharedSx = {
    display: 'flex',
    gap: 1.25,
    alignItems: 'flex-start',
    p: 1.25,
    borderRadius: 2,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'background 0.15s ease',
    '&:hover': { bgcolor: 'rgba(113, 79, 255, 0.08)' },
  };

  const content = (
    <>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(113, 79, 255, 0.1)',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        {item.icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} color="secondary.main" sx={{ lineHeight: 1.3 }}>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, display: 'block' }}>
          {item.description}
        </Typography>
      </Box>
    </>
  );

  if (isHash) {
    return (
      <Box component="a" href={item.href} onClick={onNavigate} sx={sharedSx}>
        {content}
      </Box>
    );
  }

  return (
    <Box component={RouterLink} to={item.href} onClick={onNavigate} sx={sharedSx}>
      {content}
    </Box>
  );
}

interface HospitalMarketingNavbarProps {
  onBookDemo: () => void;
}

export function HospitalMarketingNavbar({ onBookDemo }: HospitalMarketingNavbarProps) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160);
  };

  const open = (id: string) => {
    clearCloseTimer();
    setOpenMenu(id);
  };

  useEffect(() => () => clearCloseTimer(), []);

  const activeMenu = MENUS.find((m) => m.id === openMenu) ?? null;

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.96)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(12px)',
          zIndex: (t) => t.zIndex.drawer + 2,
        }}
        onMouseLeave={scheduleClose}
      >
        <Toolbar
          sx={{
            minHeight: { xs: APP_NAVBAR_HEIGHT, sm: APP_NAVBAR_HEIGHT },
            px: { xs: 1.5, md: 2.5 },
            gap: 1.5,
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            {!isMdUp ? (
              <IconButton edge="start" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            ) : null}
            <Box
              component={RouterLink}
              to="/"
              aria-label={`${brand.name} home`}
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
            >
              <Health360Logo size={isMdUp ? 32 : 28} withWordmark compact short={!isMdUp} decorative motion="interactive" />
            </Box>
          </Stack>

          {isMdUp ? (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1, justifyContent: 'center', justifyContent: 'center' }}>
              {MENUS.map((menu) => {
                const isOpen = openMenu === menu.id;
                return (
                  <Button
                    key={menu.id}
                    color="inherit"
                    onMouseEnter={() => open(menu.id)}
                    onFocus={() => open(menu.id)}
                    endIcon={
                      <KeyboardArrowDownIcon
                        sx={{
                          fontSize: 18,
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    }
                    sx={{
                      fontWeight: 700,
                      color: isOpen ? 'primary.main' : 'text.primary',
                      px: 1.5,
                      textTransform: 'none',
                    }}
                  >
                    {menu.label}
                  </Button>
                );
              })}
              <Button
                color="inherit"
                href="#hospital-security"
                sx={{ fontWeight: 700, textTransform: 'none', px: 1.5 }}
                onMouseEnter={scheduleClose}
              >
                Security
              </Button>
            </Stack>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            {isMdUp ? (
              <Button component={RouterLink} to="/login" color="inherit" sx={{ fontWeight: 700, textTransform: 'none' }}>
                Sign in
              </Button>
            ) : null}
            <Button
              variant="contained"
              size={isMdUp ? 'medium' : 'small'}
              onClick={() => {
                setOpenMenu(null);
                onBookDemo();
              }}
              sx={{ borderRadius: 999, px: { xs: 1.75, md: 2.25 }, fontWeight: 700, textTransform: 'none' }}
            >
              Book a demo
            </Button>
          </Stack>
        </Toolbar>

        {/* Megamenu panel */}
        {isMdUp && activeMenu ? (
          <Box
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '100%',
              px: { md: 2, lg: 3 },
              pb: 2,
            }}
          >
            <Container maxWidth="lg" disableGutters>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 24px 64px rgba(15, 11, 40, 0.12)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: activeMenu.columns.length >= 3 ? '2fr 1fr 1fr' : '1fr 1fr',
                    gap: 1,
                    p: 2.5,
                  }}
                >
                  {activeMenu.columns.map((col) => (
                    <Box key={col.heading}>
                      <Typography
                        variant="overline"
                        color="primary.dark"
                        sx={{ fontWeight: 800, letterSpacing: '0.12em', px: 1.25, mb: 0.75, display: 'block' }}
                      >
                        {col.heading}
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: col.items.length > 4 ? { md: '1fr 1fr' } : '1fr',
                          gap: 0.25,
                        }}
                      >
                        {col.items.map((item) => (
                          <MegaItemRow key={item.title} item={item} onNavigate={() => setOpenMenu(null)} />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1.5}
                  sx={{ px: 2.5, py: 1.75, bgcolor: 'rgba(113, 79, 255, 0.04)', borderTop: '1px solid', borderColor: 'divider' }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {activeMenu.footerNote}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setOpenMenu(null);
                        onBookDemo();
                      }}
                      sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
                    >
                      Book a demo
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="outlined"
                      size="small"
                      onClick={() => setOpenMenu(null)}
                      sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
                    >
                      User signup
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Container>
          </Box>
        ) : null}
      </AppBar>

      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: Math.min(360, typeof window !== 'undefined' ? window.innerWidth - 40 : 360), p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Health360Logo size={28} withWordmark compact />
            <IconButton aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          {MENUS.map((menu) => (
            <Accordion key={menu.id} disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={700}>{menu.label}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {menu.columns.map((col) => (
                  <Box key={col.heading} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" fontWeight={800} color="primary.dark" letterSpacing="0.1em">
                      {col.heading}
                    </Typography>
                    {col.items.map((item) => (
                      <MegaItemRow
                        key={item.title}
                        item={item}
                        onNavigate={() => setMobileOpen(false)}
                      />
                    ))}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Button component={RouterLink} to="/login" variant="outlined" fullWidth onClick={() => setMobileOpen(false)}>
              Sign in
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setMobileOpen(false);
                onBookDemo();
              }}
            >
              Book a demo
            </Button>
            <Link component={RouterLink} to="/register" onClick={() => setMobileOpen(false)} textAlign="center" fontWeight={700}>
              User signup
            </Link>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
