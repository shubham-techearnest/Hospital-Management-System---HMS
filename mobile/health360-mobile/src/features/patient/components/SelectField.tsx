import { useState } from 'react';
import { View } from 'react-native';
import { Menu, TextInput } from 'react-native-paper';
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
  compact?: boolean;
}

export function SelectField({ label, value, options, onChange, error, compact = true }: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const normalized = options.map(normalizeOption);
  const selectedLabel = normalized.find((option) => option.value === value)?.label;

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TextInput
            label={label}
            mode="outlined"
            value={value ? (selectedLabel ?? formatEnumLabel(value)) : ''}
            placeholder={`Select ${label.toLowerCase()}`}
            editable={false}
            dense={compact}
            error={error}
            right={<TextInput.Icon icon="menu-down" onPress={() => setVisible(true)} />}
            onPressIn={() => setVisible(true)}
            style={compact ? { marginBottom: 0 } : undefined}
          />
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
    </View>
  );
}
