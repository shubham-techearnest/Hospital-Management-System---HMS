export const pageSpacing = {
  container: {
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 3, sm: 4, md: 5 },
  },
  section: {
    mb: { xs: 2, md: 3 },
  },
  grid: {
    spacing: { xs: 2, md: 3 },
  },
  main: {
    flexGrow: 1,
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
    p: { xs: 2, sm: 2.5, md: 3 },
    overflowX: 'hidden' as const,
  },
};
