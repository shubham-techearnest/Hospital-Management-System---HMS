import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { SUPPORTED_LANGUAGES } from '@/features/doctor/api/doctorApi';
import {
  useAddLanguage,
  useDeleteVerificationDocument,
  useDoctorProfile,
  useRemoveLanguage,
  useSubmitForVerification,
  useUploadVerificationDocument,
} from '@/features/doctor/hooks/useDoctorQueries';
import type { AxiosError } from 'axios';

const STEPS = ['Draft', 'Submitted', 'Under Review', 'Verified'];

function activeStepIndex(status: string) {
  switch (status) {
    case 'DRAFT': return 0;
    case 'REJECTED': return 0;
    case 'PENDING_VERIFICATION': return 2;
    case 'VERIFIED': return 3;
    default: return 0;
  }
}

function formatDocType(type: string) {
  return type.replace(/_/g, ' ');
}

export function DoctorVerificationPage() {
  const { data: profile } = useDoctorProfile();
  const uploadDoc = useUploadVerificationDocument();
  const deleteDoc = useDeleteVerificationDocument();
  const addLanguage = useAddLanguage();
  const removeLanguage = useRemoveLanguage();
  const submitVerification = useSubmitForVerification();
  const regCertRef = useRef<HTMLInputElement>(null);
  const idProofRef = useRef<HTMLInputElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [missingItems, setMissingItems] = useState<string[]>([]);

  const status = profile?.verificationStatus ?? 'DRAFT';
  const editable = status === 'DRAFT' || status === 'REJECTED';
  const languages = profile?.languages ?? [];
  const documents = profile?.verificationDocuments ?? [];

  const checklist = useMemo(() => {
    if (!profile) return [];
    const hasReg = !!profile.professionalDetails.medicalRegistrationNumber;
    const hasQual = profile.qualifications.length > 0;
    const hasSpec = !!profile.specialization?.primarySpecializationId;
    const hasRegCert = documents.some((d) => d.documentType === 'REGISTRATION_CERT');
    const hasId = documents.some((d) => d.documentType === 'IDENTITY_PROOF');
    return [
      { label: 'Medical registration number', done: hasReg },
      { label: 'At least one qualification', done: hasQual },
      { label: 'Primary specialization', done: hasSpec },
      { label: 'Registration certificate uploaded', done: hasRegCert },
      { label: 'Identity proof uploaded', done: hasId },
    ];
  }, [profile, documents]);

  const checklistComplete = checklist.every((c) => c.done);

  const notify = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleUpload = async (documentType: string, file: File | undefined) => {
    if (!file) return;
    try {
      await uploadDoc.mutateAsync({ documentType, file });
      notify(`${formatDocType(documentType)} uploaded.`);
    } catch {
      notify('Unable to upload document.', 'error');
    }
  };

  const handleSubmit = async () => {
    setMissingItems([]);
    try {
      await submitVerification.mutateAsync();
      notify('Profile submitted for verification.');
    } catch (e: unknown) {
      const err = e as AxiosError<{ error?: { details?: { field: string; message: string }[] } }>;
      const details = err.response?.data?.error?.details ?? [];
      setMissingItems(details.map((d) => d.message));
      notify('Complete all requirements before submitting.', 'error');
    }
  };

  const toggleLanguage = async (code: string) => {
    try {
      if (languages.includes(code)) {
        await removeLanguage.mutateAsync(code);
      } else {
        await addLanguage.mutateAsync(code);
      }
    } catch {
      notify('Unable to update languages.', 'error');
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Verification</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload credentials and submit your profile for platform verification.
      </Typography>

      {status === 'REJECTED' && profile?.verificationRejectionReason && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Rejected: {profile.verificationRejectionReason}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStepIndex(status)} alternativeLabel sx={{ mb: 2 }}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
        <Box display="flex" justifyContent="center">
          <Chip label={status.replace(/_/g, ' ')} color={
            status === 'VERIFIED' ? 'success'
            : status === 'PENDING_VERIFICATION' ? 'warning'
            : status === 'REJECTED' ? 'error' : 'default'
          } />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Requirements checklist</Typography>
        <List dense>
          {checklist.map((item) => (
            <ListItem key={item.label}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.done ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="disabled" />}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
        {missingItems.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {missingItems.map((m) => <div key={m}>{m}</div>)}
          </Alert>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Languages spoken</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Chip
              key={lang.code}
              label={lang.label}
              color={languages.includes(lang.code) ? 'primary' : 'default'}
              variant={languages.includes(lang.code) ? 'filled' : 'outlined'}
              onClick={editable ? () => toggleLanguage(lang.code) : undefined}
              disabled={!editable || addLanguage.isPending || removeLanguage.isPending}
            />
          ))}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Verification documents</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          PDF, JPEG, or PNG up to 5 MB. Documents are visible only to platform admins.
        </Typography>

        {(['REGISTRATION_CERT', 'IDENTITY_PROOF'] as const).map((docType) => {
          const doc = documents.find((d) => d.documentType === docType);
          return (
            <Box key={docType} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2">{formatDocType(docType)}</Typography>
              {doc ? (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <UploadFileIcon fontSize="small" />
                  <Typography variant="body2">{doc.fileName}</Typography>
                  {editable && (
                    <Button size="small" color="error" onClick={async () => {
                      try {
                        await deleteDoc.mutateAsync(doc.id);
                        notify('Document removed.');
                      } catch { notify('Unable to delete document.', 'error'); }
                    }}>Remove</Button>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Not uploaded</Typography>
              )}
              {editable && (
                <>
                  <input
                    ref={docType === 'REGISTRATION_CERT' ? regCertRef : idProofRef}
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    hidden
                    onChange={(e) => handleUpload(docType, e.target.files?.[0])}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    disabled={uploadDoc.isPending}
                    onClick={() => (docType === 'REGISTRATION_CERT' ? regCertRef : idProofRef).current?.click()}
                  >
                    {doc ? 'Replace' : 'Upload'}
                  </Button>
                </>
              )}
            </Box>
          );
        })}
        {uploadDoc.isPending && <LinearProgress sx={{ mt: 1 }} />}
      </Paper>

      {editable && (
        <Button
          variant="contained"
          size="large"
          disabled={!checklistComplete || submitVerification.isPending}
          onClick={handleSubmit}
        >
          {submitVerification.isPending ? 'Submitting…' : 'Submit for Verification'}
        </Button>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
