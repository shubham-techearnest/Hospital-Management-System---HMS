import { List } from 'react-native-paper';
import type { ReactNode } from 'react';

interface ProfileAccordionSectionProps {
  title: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children: ReactNode;
}

export function ProfileAccordionSection({
  title,
  expanded,
  onExpandedChange,
  children,
}: ProfileAccordionSectionProps) {
  return (
    <List.Accordion
      title={title}
      expanded={expanded}
      onPress={() => onExpandedChange(!expanded)}
    >
      {children}
    </List.Accordion>
  );
}
