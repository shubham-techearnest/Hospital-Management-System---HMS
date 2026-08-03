import { useState } from 'react';
import { View } from 'react-native';
import { Button, Menu } from 'react-native-paper';

interface Option {
  id: string;
  label: string;
}

interface OptionSelectFieldProps {
  label: string;
  value?: string;
  options: Option[];
  onChange: (value: string) => void;
}

export function OptionSelectField({ label, value, options, onChange }: OptionSelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setVisible(true)} style={{ justifyContent: 'flex-start' }}>
            {selected ? `${label}: ${selected.label}` : `Select ${label}`}
          </Button>
        }
      >
        <Menu.Item onPress={() => { onChange(''); setVisible(false); }} title="Clear" />
        {options.map((option) => (
          <Menu.Item
            key={option.id}
            onPress={() => {
              onChange(option.id);
              setVisible(false);
            }}
            title={option.label}
          />
        ))}
      </Menu>
    </View>
  );
}
