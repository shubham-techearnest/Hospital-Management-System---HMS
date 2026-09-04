import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Menu, TextInput } from 'react-native-paper';
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
  optional?: boolean;
  disabled?: boolean;
  style?: object;
};

export function PhoneField({
  label = 'Phone',
  value = '',
  onChange,
  onBlur,
  error,
  helperText,
  required,
  optional,
  disabled,
  style,
}: PhoneFieldProps) {
  const detected = useMemo(() => detectDialCountry(), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [country, setCountry] = useState<CountryDial>(() => {
    const parsed = parsePhone(value, detected.iso);
    return getCountryByIso(parsed.iso) ?? detected;
  });
  const [national, setNational] = useState(() => parsePhone(value, detected.iso).nationalNumber);
  const [touchedLocally, setTouchedLocally] = useState(false);

  useEffect(() => {
    if (touchedLocally) return;
    const parsed = parsePhone(value, country.iso);
    setCountry(getCountryByIso(parsed.iso) ?? country);
    const nextCountry = getCountryByIso(parsed.iso) ?? country;
    setNational(digitsOnly(parsed.nationalNumber).slice(0, nextCountry.nationalLength));
  }, [value, touchedLocally]);

  const emit = (nextCountry: CountryDial, nextNational: string) => {
    setTouchedLocally(true);
    const digits = digitsOnly(nextNational).slice(0, nextCountry.nationalLength);
    setNational(digits);
    onChange(digits ? toE164(nextCountry.dialCode, digits) : '');
  };

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <Menu
          visible={menuOpen}
          onDismiss={() => setMenuOpen(false)}
          anchor={
            <TextInput
              label="Code"
              mode="outlined"
              value={formatDialLabel(country)}
              editable={false}
              disabled={disabled}
              error={error}
              onPressIn={() => !disabled && setMenuOpen(true)}
              style={styles.code}
              dense
            />
          }
        >
          {COUNTRY_DIALS.map((item) => (
            <Menu.Item
              key={item.iso}
              title={formatDialLabel(item)}
              onPress={() => {
                setCountry(item);
                setMenuOpen(false);
                emit(item, national);
              }}
            />
          ))}
        </Menu>
        <TextInput
          label={label + (required && !optional ? ' *' : '')}
          mode="outlined"
          value={national}
          onChangeText={(text) => emit(country, text)}
          onBlur={onBlur}
          keyboardType="phone-pad"
          error={error}
          disabled={disabled}
          style={styles.number}
          dense
        />
      </View>
      <HelperText type={error ? 'error' : 'info'} visible>
        {helperText ?? `+${country.dialCode} · exactly ${country.nationalLength} digits`}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  code: { width: 128 },
  number: { flex: 1 },
});
