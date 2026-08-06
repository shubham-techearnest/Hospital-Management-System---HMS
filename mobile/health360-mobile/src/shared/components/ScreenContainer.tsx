import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { appColors, layout } from '@/shared/theme';

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
  centered?: boolean;
  /** Apply bottom safe-area inset (useful for screens without tab bar) */
  safeAreaBottom?: boolean;
  children: React.ReactNode;
}

export function ScreenContainer({
  scroll = true,
  centered = false,
  safeAreaBottom = false,
  children,
  style,
  ...rest
}: ScreenContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const paddedStyle: ViewStyle = centered
    ? {}
    : {
        paddingBottom: safeAreaBottom
          ? Math.max(insets.bottom, layout.screenPaddingBottom)
          : layout.screenPaddingBottom,
      };

  const content = (
    <View
      style={[
        centered ? styles.authCard : styles.inner,
        centered && {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
        !centered && styles.standardInner,
        !centered && paddedStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  const wrapperStyle = [
    styles.flex,
    { backgroundColor: centered ? theme.colors.background : appColors.background },
  ];

  if (!scroll) {
    return (
      <KeyboardAvoidingView
        style={wrapperStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[centered ? styles.centeredOuter : styles.listOuter, !centered && styles.listPadding]}>
          {content}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={wrapperStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          centered && styles.centeredScroll,
          !centered && { paddingBottom: Math.max(insets.bottom, layout.screenPaddingBottom) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  listOuter: {
    flex: 1,
    minWidth: 0,
  },
  listPadding: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: layout.screenPaddingY,
  },
  centeredScroll: {
    justifyContent: 'center',
    minHeight: '100%',
  },
  centeredOuter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: layout.screenPaddingY,
  },
  inner: {
    flex: 1,
    minWidth: 0,
  },
  standardInner: {
    gap: layout.stackGap,
  },
  authCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    shadowColor: appColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
});
