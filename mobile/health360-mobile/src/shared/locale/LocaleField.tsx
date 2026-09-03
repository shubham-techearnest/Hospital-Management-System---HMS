import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { HelperText, Menu, TextInput } from 'react-native-paper';
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
  autoDetect?: boolean;
  style?: object;
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
  autoDetect = true,
  style,
}: LocaleFieldProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const selected = APP_LOCALES.find((l) => l.code === value);

  useEffect(() => {
    if (autoDetect && !value) {
      onChange(detectLocale());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={style}>
      <Menu
        visible={menuOpen}
        onDismiss={() => setMenuOpen(false)}
        anchor={
          <TextInput
            label={label + (required ? ' *' : '')}
            mode="outlined"
            value={selected?.label ?? value}
            editable={false}
            disabled={disabled}
            error={error}
            onPressIn={() => !disabled && setMenuOpen(true)}
            onBlur={onBlur}
            right={<TextInput.Icon icon="chevron-down" onPress={() => !disabled && setMenuOpen(true)} />}
          />
        }
      >
        {APP_LOCALES.map((locale) => (
          <Menu.Item
            key={locale.code}
            title={locale.label}
            onPress={() => {
              onChange(locale.code);
              setMenuOpen(false);
            }}
          />
        ))}
      </Menu>
      <HelperText type={error ? 'error' : 'info'} visible>
        {helperText ?? 'Language / region (auto-detected from device)'}
      </HelperText>
    </View>
  );
}
