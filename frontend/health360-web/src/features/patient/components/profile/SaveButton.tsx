import { Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion, AnimatePresence } from 'framer-motion';

interface SaveButtonProps {
  saving: boolean;
  saved: boolean;
  disabled?: boolean;
}

export function SaveButton({ saving, saved, disabled }: SaveButtonProps) {
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={disabled || saving}
      startIcon={
        <AnimatePresence mode="wait">
          {saved && (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex' }}
            >
              <CheckCircleIcon fontSize="small" />
            </motion.span>
          )}
        </AnimatePresence>
      }
    >
      {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
    </Button>
  );
}
