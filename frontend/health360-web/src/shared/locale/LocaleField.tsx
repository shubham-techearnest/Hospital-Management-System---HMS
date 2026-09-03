import { useEffect } from 'react';
import { MenuItem, TextField } from '@mui/material';
import { APP_LOCALES, detectLocale } from '@/shared/timezone/timezones';

export type LocaleFieldProps = {
  label?: string;
  value?: string;
  onChange: (locale: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  autoDetect?: boolean;
};

export function LocaleField({
  label = 'Locale',
  value = '',
  onChange,
  onBlur,
  error,
  helperText,
  required,
  disabled,
  fullWidth = true,
  autoDetect = true,
}: LocaleFieldProps) {
  useEffect(() => {
    if (autoDetect && !value) {
      onChange(detectLocale());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effective = APP_LOCALES.some((l) => l.code === value) ? value : '';

  return (
    <TextField
      select
      label={label}
      value={effective}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={error}
      helperText={helperText ?? 'Language / region (auto-detected from device)'}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
    >
      {APP_LOCALES.map((locale) => (
        <MenuItem key={locale.code} value={locale.code}>
          {locale.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
