import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { appColors, layout } from '@/shared/theme';

interface ScreenIntroProps {
  description: string;
}

/** Subtitle below the navigation header — avoids duplicating the screen title */
export function ScreenIntro({ description }: ScreenIntroProps) {
  return (
    <Text variant="bodyMedium" style={styles.text}>
      {description}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: appColors.textSecondary,
    lineHeight: layout.textLineHeight,
    marginBottom: 8,
  },
});
