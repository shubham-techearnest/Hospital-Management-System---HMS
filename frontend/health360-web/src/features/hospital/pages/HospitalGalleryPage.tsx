import { useRef, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, CardMedia, IconButton,
  Snackbar, Stack, TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { galleryImageSrc } from '@/features/hospital/api/hospitalApi';
import {
  useDeleteGalleryImage,
  useGalleryImages,
  useUploadGalleryImage,
} from '@/features/hospital/hooks/useHospitalQueries';

export function HospitalGalleryPage() {
  const { data: images = [], isError } = useGalleryImages();
  const uploadImage = useUploadGalleryImage();
  const deleteImage = useDeleteGalleryImage();
  const fileRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleUpload = async (file: File) => {
    try {
      await uploadImage.mutateAsync({ file, caption: caption || undefined, displayOrder: images.length });
      setCaption('');
      if (fileRef.current) fileRef.current.value = '';
      setSnackbar({ open: true, message: 'Image uploaded.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Unable to upload image.', severity: 'error' });
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={2}>Photo Gallery</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Upload photos of your hospital facilities, building, and departments for the public profile.
      </Typography>
      {isError && <Alert severity="error" sx={{ mb: 2 }}>Create hospital profile first.</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField label="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} fullWidth />
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => fileRef.current?.click()}
          disabled={uploadImage.isPending}
        >
          Upload image
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {images.map((img) => (
          <Card key={img.id} variant="outlined">
            <CardMedia
              component="img"
              height="180"
              image={galleryImageSrc(img.imageUrl)}
              alt={img.caption ?? 'Hospital photo'}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2">{img.caption ?? 'No caption'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(img.fileSizeBytes / 1024).toFixed(0)} KB
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => deleteImage.mutate(img.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {images.length === 0 && (
        <Alert severity="info">No gallery images yet. Upload your first photo above.</Alert>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
