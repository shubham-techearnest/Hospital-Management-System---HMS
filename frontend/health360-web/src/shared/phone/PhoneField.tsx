import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';
import { COUNTRY_DIALS, type CountryDial } from './countries';
import {
  detectDialCountry,
  digitsOnly,
  formatDialLabel,
  getCountryByIso,
  parsePhone,
  toE164,
} from './phoneUtils';

export type PhoneFieldProps = {
  label?: string;
  value?: string;
  onChange: (e164: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  optional?: boolean;
};

export function PhoneField({
  label = 'Phone',
  value = '',
  onChange,
  onBlur,
  error,
  helperText,
  required,
  disabled,
  fullWidth = true,
  optional,
}: PhoneFieldProps) {
  const detected = useMemo(() => detectDialCountry(), []);
  const [country, setCountry] = useState<CountryDial>(() => {
    const parsed = parsePhone(value, detected.iso);
    return getCountryByIso(parsed.iso) ?? detected;
  });
  const [national, setNational] = useState(() => parsePhone(value, detected.iso).nationalNumber);
  const [touchedLocally, setTouchedLocally] = useState(false);

  useEffect(() => {
    if (touchedLocally) return;
    const parsed = parsePhone(value, country.iso);
    const nextCountry = getCountryByIso(parsed.iso) ?? country;
    setCountry(nextCountry);
    setNational(parsed.nationalNumber);
  }, [value, touchedLocally]);

  const emit = (nextCountry: CountryDial, nextNational: string) => {
    setTouchedLocally(true);
    const digits = digitsOnly(nextNational).slice(0, nextCountry.nationalLength + 1);
    setNational(digits);
    onChange(digits ? toE164(nextCountry.dialCode, digits) : '');
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Autocomplete
        options={COUNTRY_DIALS}
        value={country}
        disabled={disabled}
        disableClearable
        onChange={(_, next) => {
          if (!next) return;
          setCountry(next);
          emit(next, national);
        }}
        getOptionLabel={(option) => formatDialLabel(option)}
        isOptionEqualToValue={(a, b) => a.iso === b.iso}
        sx={{ minWidth: 140, maxWidth: 180 }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Code"
            error={error}
            required={Boolean(required && !optional)}
          />
        )}
      />
      <TextField
        label={label}
        value={national}
        onChange={(e) => emit(country, e.target.value)}
        onBlur={onBlur}
        error={error}
        helperText={
          helperText
          ?? `+${country.dialCode} · about ${country.nationalLength} digits`
        }
        required={Boolean(required && !optional)}
        disabled={disabled}
        fullWidth={fullWidth}
        inputMode="tel"
        autoComplete="tel-national"
      />
    </Box>
  );
}
