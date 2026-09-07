import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import {
  useAddAdminPartnerLocation,
  useAddAdminPartnerMembership,
  useAdminPartner,
  useAdminPartnerLinks,
  useAdminPartnerMemberships,
  useLinkAdminPartnerHospital,
  useUpdateAdminPartner,
  useUpdateAdminPartnerMembership,
} from '../hooks/useAdminPartnerQueries';

export function AdminPartnerDetailPage() {
  const { partnerOrgId = '' } = useParams();
  const { data: partner, isError, error, isLoading } = useAdminPartner(partnerOrgId);
  const { data: links = [] } = useAdminPartnerLinks(partnerOrgId);
  const { data: memberships = [] } = useAdminPartnerMemberships(partnerOrgId);
  const updatePartner = useUpdateAdminPartner();
  const addLocation = useAddAdminPartnerLocation();
  const linkHospital = useLinkAdminPartnerHospital();
  const addMembership = useAddAdminPartnerMembership();
  const updateMembership = useUpdateAdminPartnerMembership();

  const [message, setMessage] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [locationForm, setLocationForm] = useState({
    name: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    primaryLocation: true,
  });
  const [linkForm, setLinkForm] = useState({ hospitalId: '', linkType: 'IN_NETWORK' });
  const [memberForm, setMemberForm] = useState({ userId: '', jobTitle: '', employmentStatus: 'ACTIVE' });

  const loadError = isError ? parseApiError(error) : null;

  const handleStatus = async (status: string) => {
    setMessage(null);
    try {
      await updatePartner.mutateAsync({ partnerOrgId, status });
      setMessage(`Status updated to ${status}.`);
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  const handleAddLocation = async () => {
    setMessage(null);
    const lat = Number(locationForm.latitude);
    const lng = Number(locationForm.longitude);
    if (!locationForm.name.trim() || !locationForm.addressLine1.trim()
      || !locationForm.city.trim() || !locationForm.state.trim() || !locationForm.pincode.trim()
      || Number.isNaN(lat) || Number.isNaN(lng)) {
      setMessage('Fill all required location fields including valid coordinates.');
      return;
    }
    try {
      await addLocation.mutateAsync({
        partnerOrgId,
        name: locationForm.name.trim(),
        addressLine1: locationForm.addressLine1.trim(),
        city: locationForm.city.trim(),
        state: locationForm.state.trim(),
        pincode: locationForm.pincode.trim(),
        latitude: lat,
        longitude: lng,
        phone: locationForm.phone.trim() || undefined,
        email: locationForm.email.trim() || undefined,
        primaryLocation: locationForm.primaryLocation,
      });
      setLocationOpen(false);
      setLocationForm({
        name: '', addressLine1: '', city: '', state: '', pincode: '',
        latitude: '', longitude: '', phone: '', email: '', primaryLocation: true,
      });
      setMessage('Location added.');
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  const handleLinkHospital = async () => {
    setMessage(null);
    if (!linkForm.hospitalId.trim()) {
      setMessage('Hospital ID is required.');
      return;
    }
    try {
      await linkHospital.mutateAsync({
        partnerOrgId,
        hospitalId: linkForm.hospitalId.trim(),
        linkType: linkForm.linkType,
      });
      setLinkOpen(false);
      setLinkForm({ hospitalId: '', linkType: 'IN_NETWORK' });
      setMessage('Hospital linked.');
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  const handleAddMembership = async () => {
    setMessage(null);
    if (!memberForm.userId.trim()) {
      setMessage('User ID is required.');
      return;
    }
    try {
      await addMembership.mutateAsync({
        partnerOrgId,
        userId: memberForm.userId.trim(),
        jobTitle: memberForm.jobTitle.trim() || undefined,
        employmentStatus: memberForm.employmentStatus,
      });
      setMemberOpen(false);
      setMemberForm({ userId: '', jobTitle: '', employmentStatus: 'ACTIVE' });
      setMessage('Membership added.');
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  return (
    <AnimatedPage>
      <Typography component={RouterLink} to="/admin/partners" variant="body2" color="primary" sx={{ mb: 1, display: 'inline-block' }}>
        ← Partners
      </Typography>

      {isLoading && <Typography color="text.secondary">Loading…</Typography>}
      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError.message}</Alert>}
      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message}</Alert>
      )}

      {partner ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
              <div>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="h5" fontWeight={700}>{partner.name}</Typography>
                  <Chip size="small" label={partner.status} />
                  <Chip size="small" variant="outlined" label={partner.orgType} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {partner.registrationNumber ?? 'No registration number'}
                </Typography>
              </div>
              <Stack direction="row" spacing={1}>
                {partner.status !== 'ACTIVE' && (
                  <Button size="small" variant="outlined" onClick={() => handleStatus('ACTIVE')}>
                    Activate
                  </Button>
                )}
                {partner.status === 'ACTIVE' && (
                  <Button size="small" color="warning" variant="outlined" onClick={() => handleStatus('SUSPENDED')}>
                    Suspend
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>Locations</Typography>
              <Button size="small" variant="contained" onClick={() => setLocationOpen(true)}>Add location</Button>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Coords</TableCell>
                    <TableCell>Primary</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(partner.locations ?? []).length === 0 && (
                    <TableRow><TableCell colSpan={5}>No locations yet.</TableCell></TableRow>
                  )}
                  {(partner.locations ?? []).map((loc) => (
                    <TableRow key={loc.locationId}>
                      <TableCell>{loc.name}</TableCell>
                      <TableCell>{loc.addressLine1}</TableCell>
                      <TableCell>{loc.city}, {loc.state} {loc.pincode}</TableCell>
                      <TableCell>{loc.latitude}, {loc.longitude}</TableCell>
                      <TableCell>{loc.primaryLocation ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>Hospital links</Typography>
              <Button size="small" variant="contained" onClick={() => setLinkOpen(true)}>Link hospital</Button>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hospital ID</TableCell>
                    <TableCell>Link type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {links.length === 0 && (
                    <TableRow><TableCell colSpan={3}>No hospital links yet.</TableCell></TableRow>
                  )}
                  {links.map((l) => (
                    <TableRow key={l.linkId}>
                      <TableCell>
                        <Typography component={RouterLink} to={`/admin/hospitals/${l.hospitalId}`} color="primary" variant="body2">
                          {l.hospitalId}
                        </Typography>
                      </TableCell>
                      <TableCell>{l.linkType}</TableCell>
                      <TableCell>{l.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>Memberships</Typography>
              <Button size="small" variant="contained" onClick={() => setMemberOpen(true)}>Add member</Button>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Job title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memberships.length === 0 && (
                    <TableRow><TableCell colSpan={4}>No members yet.</TableCell></TableRow>
                  )}
                  {memberships.map((m) => (
                    <TableRow key={m.membershipId}>
                      <TableCell>
                        <Typography variant="body2">{m.userName ?? m.userId}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.userEmail ?? m.userId}</Typography>
                      </TableCell>
                      <TableCell>{m.jobTitle ?? '—'}</TableCell>
                      <TableCell>{m.employmentStatus}</TableCell>
                      <TableCell align="right">
                        {m.employmentStatus === 'ACTIVE' ? (
                          <Button
                            size="small"
                            disabled={updateMembership.isPending}
                            onClick={async () => {
                              try {
                                await updateMembership.mutateAsync({
                                  partnerOrgId,
                                  membershipId: m.membershipId,
                                  employmentStatus: 'INACTIVE',
                                });
                                setMessage('Member deactivated.');
                              } catch (e) {
                                setMessage(parseApiError(e).message);
                              }
                            }}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            disabled={updateMembership.isPending}
                            onClick={async () => {
                              try {
                                await updateMembership.mutateAsync({
                                  partnerOrgId,
                                  membershipId: m.membershipId,
                                  employmentStatus: 'ACTIVE',
                                });
                                setMessage('Member activated.');
                              } catch (e) {
                                setMessage(parseApiError(e).message);
                              }
                            }}
                          >
                            Activate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      ) : null}

      <Dialog open={locationOpen} onClose={() => setLocationOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add location</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" required fullWidth value={locationForm.name}
              onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })} />
            <TextField label="Address line 1" required fullWidth value={locationForm.addressLine1}
              onChange={(e) => setLocationForm({ ...locationForm, addressLine1: e.target.value })} />
            <Stack direction="row" spacing={1}>
              <TextField label="City" required fullWidth value={locationForm.city}
                onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })} />
              <TextField label="State" required fullWidth value={locationForm.state}
                onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })} />
            </Stack>
            <TextField label="Pincode" required fullWidth value={locationForm.pincode}
              onChange={(e) => setLocationForm({ ...locationForm, pincode: e.target.value })} />
            <Stack direction="row" spacing={1}>
              <TextField label="Latitude" required fullWidth value={locationForm.latitude}
                onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })} />
              <TextField label="Longitude" required fullWidth value={locationForm.longitude}
                onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField label="Phone" fullWidth value={locationForm.phone}
                onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })} />
              <TextField label="Email" fullWidth value={locationForm.email}
                onChange={(e) => setLocationForm({ ...locationForm, email: e.target.value })} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLocation} disabled={addLocation.isPending}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Link hospital</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Hospital ID"
              required
              fullWidth
              value={linkForm.hospitalId}
              onChange={(e) => setLinkForm({ ...linkForm, hospitalId: e.target.value })}
              helperText="UUID from Hospitals directory"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Link type</InputLabel>
              <Select
                label="Link type"
                value={linkForm.linkType}
                onChange={(e) => setLinkForm({ ...linkForm, linkType: e.target.value })}
              >
                <MenuItem value="IN_NETWORK">IN_NETWORK</MenuItem>
                <MenuItem value="PREFERRED">PREFERRED</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLinkHospital} disabled={linkHospital.isPending}>Link</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={memberOpen} onClose={() => setMemberOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="User ID"
              required
              fullWidth
              value={memberForm.userId}
              onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
              helperText="UUID from Users directory"
            />
            <TextField
              label="Job title"
              fullWidth
              value={memberForm.jobTitle}
              onChange={(e) => setMemberForm({ ...memberForm, jobTitle: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={memberForm.employmentStatus}
                onChange={(e) => setMemberForm({ ...memberForm, employmentStatus: e.target.value })}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                <MenuItem value="TERMINATED">TERMINATED</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMembership} disabled={addMembership.isPending}>Add</Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
