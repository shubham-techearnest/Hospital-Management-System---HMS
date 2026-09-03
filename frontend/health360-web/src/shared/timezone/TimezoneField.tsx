import { useEffect, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { detectTimezone, listTimezones } from './timezones';

export type TimezoneFieldProps = {
  label?: string;
  value?: string;
  onChange: (timezone: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  autoDetect?: boolean;
};

export function TimezoneField({
  label = 'Timezone',
  value = '',
  onChange,
  onBlur,
  error,
  helperText,
  required,
  disabled,
  fullWidth = true,
  autoDetect = true,
}: TimezoneFieldProps) {
  const options = useMemo(() => listTimezones(), []);

  useEffect(() => {
    if (autoDetect && !value) {
      onChange(detectTimezone());
    }
    // intentionally once on mount / when empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = value && options.includes(value) ? value : value || null;

  return (
    <Autocomplete
      options={options}
      value={selected}
      disabled={disabled}
      onChange={(_, next) => onChange(next ?? '')}
      onBlur={onBlur}
      fullWidth={fullWidth}
      filterOptions={(opts, state) => {
        const q = state.inputValue.trim().toLowerCase();
        if (!q) return opts;
        return opts.filter((tz) => tz.toLowerCase().includes(q));
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText ?? 'IANA timezone (auto-detected from device)'}
          required={required}
        />
      )}
    />
  );
}
