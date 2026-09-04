import type { UseFormProps } from 'react-hook-form';

/**
 * Live field feedback: validate after first blur/touch, then on every change.
 * Avoids empty-field noise on first paint while still showing immediate warnings.
 */
export const liveValidationOptions = {
  mode: 'onTouched',
  reValidateMode: 'onChange',
  criteriaMode: 'firstError',
} as const satisfies Pick<UseFormProps, 'mode' | 'reValidateMode' | 'criteriaMode'>;
