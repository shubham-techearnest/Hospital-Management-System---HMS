import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { layout } from '@/shared/theme';

export interface FilterChipOption<T extends string = string> {
  value: T;
  label: string;
}

interface FilterChipRowProps<T extends string = string> {
  value: T;
  options: FilterChipOption<T>[];
  onChange: (value: T) => void;
}

/** Compact horizontal filter tabs — less vertical space than SegmentedButtons */
export function FilterChipRow<T extends string = string>({ value, options, onChange }: FilterChipRowProps<T>) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((option) => (
          <Chip
            key={option.value}
            compact
            selected={value === option.value}
            onPress={() => onChange(option.value)}
            style={styles.chip}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: layout.stackGap,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    height: 32,
  },
});
