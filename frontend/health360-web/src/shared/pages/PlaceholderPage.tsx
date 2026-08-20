import InboxIcon from '@mui/icons-material/Inbox';
import { EmptyState } from '@/shared/ui/EmptyState';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <EmptyState
      icon={<InboxIcon />}
      title={title}
      description="This section is not available in the current release."
    />
  );
}
