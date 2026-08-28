import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, FormControl, InputLabel, MenuItem, Select,
  Stack, TextField, Typography, CircularProgress, IconButton, Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import {
  useDeleteHealthDocument,
  useDocumentCenter,
  useDownloadHealthDocument,
  useHealthDocuments,
  useUploadHealthDocument,
} from '@/features/patient/hooks/usePatientExtendedQueries';

const CATEGORIES = ['LAB_REPORT', 'PRESCRIPTION', 'SCAN', 'INVOICE', 'CERTIFICATE', 'OTHER'] as const;

export function HealthDocumentsPage() {
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('LAB_REPORT');
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, error } = useHealthDocuments(page, category || undefined);
  const { data: centerItems = [], isLoading: centerLoading, error: centerError } = useDocumentCenter(category || undefined);
  const uploadMutation = useUploadHealthDocument();
  const deleteMutation = useDeleteHealthDocument();
  const downloadMutation = useDownloadHealthDocument();

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !title.trim()) {
      setMessage({ type: 'error', text: 'Select a file and enter a title.' });
      return;
    }
    setMessage(null);
    try {
      await uploadMutation.mutateAsync({ file, category: uploadCategory, title: title.trim(), description: description || undefined });
      setMessage({ type: 'success', text: 'Document uploaded.' });
      setTitle('');
      setDescription('');
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      setMessage({ type: 'error', text: 'Upload failed. Max 10 MB, PDF/JPEG/PNG only.' });
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} gutterBottom>Document center</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Uploads plus linked prescriptions, lab reports, invoices, and certificates.
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Upload document</Typography>
          <Stack spacing={2}>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c.replace(/_/g, ' ')}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            <TextField label="Description" multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button startIcon={<UploadFileIcon />} variant="contained" onClick={handleUpload} disabled={uploadMutation.isPending}>Upload</Button>
          </Stack>
          {message ? <Alert severity={message.type} sx={{ mt: 2 }}>{message.text}</Alert> : null}
        </CardContent>
      </Card>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter</InputLabel>
          <Select label="Filter" value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>All records</Typography>
      {centerLoading ? <CircularProgress size={24} /> : null}
      {centerError ? <Alert severity="error">Unable to load document center.</Alert> : null}
      <Stack spacing={1} sx={{ mb: 4 }}>
        {centerItems.map((item) => (
          <Card key={item.itemId} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip size="small" label={item.category.replace(/_/g, ' ')} />
                    <Chip size="small" variant="outlined" label={item.source} />
                  </Stack>
                  <Typography fontWeight={600}>{item.title}</Typography>
                  {item.description ? (
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                  ) : null}
                  <Typography variant="caption">{new Date(item.occurredAt).toLocaleString()}</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  {item.downloadable && item.referenceId ? (
                    <IconButton
                      aria-label="download"
                      onClick={() => downloadMutation.mutate({ id: item.referenceId!, fileName: item.title })}
                    >
                      <DownloadIcon />
                    </IconButton>
                  ) : null}
                  {item.deepLink ? (
                    <Button component={RouterLink} to={item.deepLink} size="small">Open</Button>
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {centerItems.length === 0 && !centerLoading ? (
          <Alert severity="info">No documents yet. Upload a file or complete a visit to see linked records.</Alert>
        ) : null}
      </Stack>

      <Divider sx={{ mb: 3 }} />
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>My uploads</Typography>
      {isLoading ? <CircularProgress /> : null}
      {error ? <Alert severity="error">Unable to load uploads.</Alert> : null}
      <Stack spacing={1}>
        {(data?.content ?? []).map((doc) => (
          <Card key={doc.id} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography fontWeight={600}>{doc.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{doc.category.replace(/_/g, ' ')} · {doc.fileName}</Typography>
                  <Typography variant="caption">{new Date(doc.uploadedAt).toLocaleString()}</Typography>
                </Box>
                <Stack direction="row">
                  <IconButton aria-label="download" onClick={() => downloadMutation.mutate({ id: doc.id, fileName: doc.fileName })}>
                    <DownloadIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => deleteMutation.mutate(doc.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
      {data && data.totalPages > 1 ? (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
