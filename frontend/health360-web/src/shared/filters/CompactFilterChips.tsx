import { Chip, Stack } from '@mui/material';

export interface FilterChipOption<T extends string = string> {
  value: T;
  label: string;
}

interface CompactFilterChipsProps<T extends string = string> {
  value: T;
  options: FilterChipOption<T>[];
  onChange: (value: T) => void;
}

/** Compact appointment/search filter row — replaces full-width Tabs on list pages */
export function CompactFilterChips<T extends string = string>({ value, options, onChange }: CompactFilterChipsProps<T>) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          size="small"
          color={value === option.value ? 'primary' : 'default'}
          variant={value === option.value ? 'filled' : 'outlined'}
          onClick={() => onChange(option.value)}
          sx={{ height: 28, fontSize: '0.8125rem' }}
        />
      ))}
    </Stack>
  );
}
