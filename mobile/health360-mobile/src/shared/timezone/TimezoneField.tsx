import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Menu, TextInput } from 'react-native-paper';
import { detectTimezone, listTimezoneOptions } from './timezones';

export type TimezoneFieldProps = {
  label?: string;
  value?: string;
  onChange: (timezone: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  autoDetect?: boolean;
  style?: object;
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
  autoDetect = true,
  style,
}: TimezoneFieldProps) {
  const options = useMemo(() => listTimezoneOptions(value), [value]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (autoDetect && !value) {
      onChange(detectTimezone());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return options;
    return options.filter((tz) => tz.toLowerCase().includes(q));
  }, [filter, options]);

  return (
    <View style={style}>
      <Menu
        visible={menuOpen}
        onDismiss={() => setMenuOpen(false)}
        anchor={
          <TextInput
            label={label + (required ? ' *' : '')}
            mode="outlined"
            value={value}
            editable={false}
            disabled={disabled}
            error={error}
            onPressIn={() => !disabled && setMenuOpen(true)}
            onBlur={onBlur}
            right={<TextInput.Icon icon="chevron-down" onPress={() => !disabled && setMenuOpen(true)} />}
          />
        }
      >
        <View style={styles.filterWrap}>
          <TextInput
            label="Filter timezones"
            mode="outlined"
            dense
            value={filter}
            onChangeText={setFilter}
            style={styles.filter}
          />
        </View>
        {filtered.map((tz) => (
          <Menu.Item
            key={tz}
            title={tz}
            onPress={() => {
              onChange(tz);
              setMenuOpen(false);
              setFilter('');
            }}
          />
        ))}
      </Menu>
      <HelperText type={error ? 'error' : 'info'} visible>
        {helperText ?? 'Major timezones only (auto-detected when possible)'}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  filterWrap: { paddingHorizontal: 12, paddingBottom: 8 },
  filter: { backgroundColor: 'transparent' },
});
