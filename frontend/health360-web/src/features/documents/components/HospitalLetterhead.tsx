import { useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import type { LetterheadSnapshot } from '@/features/documents/api/documentsApi';

type Props = {
  letterhead: LetterheadSnapshot;
  documentTitle: string;
  documentNumber?: string | null;
  issuedAt?: string | null;
};

export function HospitalLetterhead({ letterhead, documentTitle, documentNumber, issuedAt }: Props) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!letterhead.hasLogo || !letterhead.logoUrl) {
        setLogoSrc(null);
        return;
      }
      try {
        const path = letterhead.logoUrl.replace(/^\/api\/v1/, '');
        const res = await apiClient.get(path, { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        blobRef.current = url;
        if (!cancelled) setLogoSrc(url);
      } catch {
        if (!cancelled) setLogoSrc(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [letterhead.hasLogo, letterhead.logoUrl]);

  const address = [
    letterhead.addressLine1,
    letterhead.addressLine2,
    [letterhead.city, letterhead.state, letterhead.pincode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Box className="doc-letterhead" sx={{ mb: 2, pb: 1.5, borderBottom: '2px solid #222' }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {logoSrc ? (
          <Box
            component="img"
            src={logoSrc}
            alt=""
            sx={{ width: 72, height: 72, objectFit: 'contain' }}
          />
        ) : null}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: 0.3 }}>
            {letterhead.hospitalName}
          </Typography>
          {letterhead.tagline ? (
            <Typography variant="body2" color="text.secondary">{letterhead.tagline}</Typography>
          ) : null}
          {letterhead.registrationNumber ? (
            <Typography variant="caption" display="block">
              Reg. No: {letterhead.registrationNumber}
              {letterhead.accreditation && letterhead.accreditation !== 'NONE'
                ? ` · ${letterhead.accreditation}`
                : ''}
            </Typography>
          ) : null}
          {address ? (
            <Typography variant="caption" display="block" color="text.secondary">
              {address}
            </Typography>
          ) : null}
          <Typography variant="caption" display="block" color="text.secondary">
            {[letterhead.phone ? `Tel: ${letterhead.phone}` : null, letterhead.email]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', minWidth: 140 }}>
          <Typography variant="subtitle2" fontWeight={700}>{documentTitle}</Typography>
          {documentNumber ? (
            <Typography variant="caption" display="block">No: {documentNumber}</Typography>
          ) : null}
          {issuedAt ? (
            <Typography variant="caption" display="block">Date: {issuedAt}</Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}
