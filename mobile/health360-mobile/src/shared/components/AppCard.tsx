import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from 'react-native-paper';
import { appColors } from '@/shared/theme';

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
}

export function AppCard({ children, style, ...rest }: AppCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: appColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
});
