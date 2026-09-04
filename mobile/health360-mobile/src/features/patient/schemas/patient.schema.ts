import { z } from 'zod';
import {
  optionalIsoCountrySchema,
  optionalNumber,
  optionalPincodeSchema,
  phoneOptionalSchema,
  phoneRequiredSchema,
} from '@/shared/validation/inputSchemas';

export const basicInfoSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.string().max(30).optional(),
  bloodGroup: z.string().max(20).optional(),
  maritalStatus: z.string().max(20).optional(),
  nationality: optionalIsoCountrySchema,
  profilePhotoUrl: z.string().max(500).optional(),
});

export type BasicInfoForm = z.infer<typeof basicInfoSchema>;

export const addressSchema = z.object({
  line1: z.string().max(200).optional(),
  line2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: optionalPincodeSchema,
  country: optionalIsoCountrySchema,
});

export const contactInfoSchema = z.object({
  primaryPhone: phoneOptionalSchema,
  secondaryPhone: phoneOptionalSchema,
  permanentAddress: addressSchema.optional(),
  currentAddress: addressSchema.optional(),
  sameAsPermanentAddress: z.boolean().optional(),
});

export type ContactInfoForm = z.infer<typeof contactInfoSchema>;

export const physicalMeasurementsSchema = z.object({
  heightCm: optionalNumber({
    min: 30,
    max: 300,
    minMessage: 'Height must be at least 30 cm',
    maxMessage: 'Height must be 300 cm or less',
  }),
  weightKg: optionalNumber({
    min: 1,
    max: 500,
    minMessage: 'Weight must be at least 1 kg',
    maxMessage: 'Weight must be 500 kg or less',
  }),
  waistCm: optionalNumber({ min: 1, max: 400, minMessage: 'Enter a valid waist size' }),
  hipCm: optionalNumber({ min: 1, max: 400, minMessage: 'Enter a valid hip size' }),
  neckCm: optionalNumber({ min: 1, max: 100, minMessage: 'Enter a valid neck size' }),
  bodyFatPercent: optionalNumber({
    min: 1,
    max: 70,
    minMessage: 'Body fat must be at least 1%',
    maxMessage: 'Body fat must be 70% or less',
  }),
  measuredAt: z.string().min(1, 'Measurement date is required'),
});

export type PhysicalMeasurementsForm = z.infer<typeof physicalMeasurementsSchema>;

export const lifestyleSchema = z.object({
  smokingStatus: z.string().max(20).optional(),
  smokingFrequency: z.string().max(20).optional(),
  alcoholConsumption: z.string().max(20).optional(),
  exerciseFrequency: z.string().max(20).optional(),
  exerciseType: z.string().max(100).optional(),
  exerciseDurationMinutes: optionalNumber({
    min: 0,
    max: 600,
    maxMessage: 'Duration must be 600 minutes or less',
  }),
  occupationType: z.string().max(20).optional(),
  averageSleepHours: optionalNumber({
    min: 0,
    max: 24,
    maxMessage: 'Sleep hours must be 24 or less',
  }),
  dietaryPreference: z.string().max(20).optional(),
  stressLevel: optionalNumber({
    min: 1,
    max: 5,
    minMessage: 'Stress level must be 1–5',
    maxMessage: 'Stress level must be 1–5',
  }),
});

export type LifestyleForm = z.infer<typeof lifestyleSchema>;

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  relationship: z.string().trim().min(1, 'Relationship is required').max(50),
  phone: phoneRequiredSchema,
  email: z
    .string()
    .trim()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: 'Enter a valid email address',
    }),
  primary: z.boolean().optional(),
});

export type EmergencyContactForm = z.infer<typeof emergencyContactSchema>;
