import { useState } from 'react';
import { View } from 'react-native';
import { Button, Menu, TextInput } from 'react-native-paper';
import { formatEnumLabel } from '@/features/patient/utils/patientUtils';

export type SelectOption = string | { value: string; label: string };

function normalizeOption(option: SelectOption): { value: string; label: string } {
  return typeof option === 'string'
    ? { value: option, label: formatEnumLabel(option) }
    : option;
}

interface SelectFieldProps {
  label: string;
  value?: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  error?: boolean;
}

export function SelectField({ label, value, options, onChange, error }: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const normalized = options.map(normalizeOption);
  const selectedLabel = normalized.find((option) => option.value === value)?.label;

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setVisible(true)} style={{ justifyContent: 'flex-start' }}>
            {value ? `${label}: ${selectedLabel ?? formatEnumLabel(value)}` : `Select ${label}`}
          </Button>
        }
      >
        <Menu.Item onPress={() => { onChange(''); setVisible(false); }} title="Clear" />
        {normalized.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => {
              onChange(option.value);
              setVisible(false);
            }}
            title={option.label}
          />
        ))}
      </Menu>
      {error ? <TextInput error={error} style={{ height: 0, opacity: 0 }} /> : null}
    </View>
  );
}
