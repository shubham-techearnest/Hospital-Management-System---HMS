import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import type { TimelineEvent } from '../api/analyticsApi';

interface RecentTimelineProps {
  events: TimelineEvent[];
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RecentTimeline({ events }: RecentTimelineProps) {
  if (events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No recent health events yet. Record vitals or update measurements to build your timeline.
      </Typography>
    );
  }

  return (
    <List dense disablePadding>
      {events.map((event) => (
        <ListItem key={`${event.eventType}-${event.referenceId ?? event.occurredAt}`} disableGutters>
          <ListItemText
            primary={event.title}
            secondary={
              <Box component="span" display="block">
                <Typography component="span" variant="body2" color="text.secondary">
                  {event.description}
                </Typography>
                <Typography component="span" variant="caption" color="text.disabled" display="block">
                  {formatWhen(event.occurredAt)}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
