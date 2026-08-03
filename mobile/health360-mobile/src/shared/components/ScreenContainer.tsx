import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { appColors, layout } from '@/shared/theme';

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
  centered?: boolean;
  children: React.ReactNode;
}

export function ScreenContainer({
  scroll = true,
  centered = false,
  children,
  style,
  ...rest
}: ScreenContainerProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        centered ? styles.authCard : styles.inner,
        centered && {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
        !centered && styles.standardInner,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  const wrapperStyle = [
    styles.flex,
    centered && { backgroundColor: theme.colors.background },
  ];

  if (!scroll) {
    return (
      <KeyboardAvoidingView
        style={wrapperStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={centered ? styles.centeredOuter : styles.flex}>{content}</View>
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
    backgroundColor: appColors.background,
    paddingBottom: layout.sectionGap,
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
