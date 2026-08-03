import { Button } from 'react-native-paper';

interface SaveButtonProps {
  saving: boolean;
  saved: boolean;
  onPress: () => void;
}

export function SaveButton({ saving, saved, onPress }: SaveButtonProps) {
  return (
    <Button mode="contained" onPress={onPress} loading={saving} disabled={saving}>
      {saved ? 'Saved' : saving ? 'Saving…' : 'Save'}
    </Button>
  );
}
