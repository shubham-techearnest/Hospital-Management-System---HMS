import { z } from 'zod';

export const basicInfoSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.string().max(30).optional(),
  bloodGroup: z.string().max(20).optional(),
  maritalStatus: z.string().max(20).optional(),
  nationality: z.string().length(2).optional().or(z.literal('')),
  profilePhotoUrl: z.string().max(500).optional(),
});

export type BasicInfoForm = z.infer<typeof basicInfoSchema>;

export const addressSchema = z.object({
  line1: z.string().max(200).optional(),
  line2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().or(z.literal('')),
  country: z.string().length(2).optional().or(z.literal('')),
});

export const contactInfoSchema = z.object({
  primaryPhone: z.string().max(20).optional(),
  secondaryPhone: z.string().max(20).optional(),
  permanentAddress: addressSchema.optional(),
  currentAddress: addressSchema.optional(),
  sameAsPermanentAddress: z.boolean().optional(),
});

export type ContactInfoForm = z.infer<typeof contactInfoSchema>;

export const physicalMeasurementsSchema = z.object({
  heightCm: z.coerce.number().min(30).max(300).optional(),
  weightKg: z.coerce.number().min(1).max(500).optional(),
  waistCm: z.coerce.number().optional(),
  hipCm: z.coerce.number().optional(),
  neckCm: z.coerce.number().optional(),
  bodyFatPercent: z.coerce.number().optional(),
  measuredAt: z.string().min(1, 'Measurement date is required'),
});

export type PhysicalMeasurementsForm = z.infer<typeof physicalMeasurementsSchema>;

export const lifestyleSchema = z.object({
  smokingStatus: z.string().max(20).optional(),
  smokingFrequency: z.string().max(20).optional(),
  alcoholConsumption: z.string().max(20).optional(),
  exerciseFrequency: z.string().max(20).optional(),
  exerciseType: z.string().max(100).optional(),
  exerciseDurationMinutes: z.coerce.number().optional(),
  occupationType: z.string().max(20).optional(),
  averageSleepHours: z.coerce.number().optional(),
  dietaryPreference: z.string().max(20).optional(),
  stressLevel: z.coerce.number().min(1).max(5).optional(),
});

export type LifestyleForm = z.infer<typeof lifestyleSchema>;

export const allergySchema = z.object({
  name: z.string().min(1).max(200),
  severity: z.string().min(1).max(20),
  reaction: z.string().max(500).optional(),
  diagnosedDate: z.string().optional(),
});

export type AllergyForm = z.infer<typeof allergySchema>;

export const medicationSchema = z.object({
  name: z.string().min(1).max(200),
  dosage: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  route: z.string().max(50).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prescribingDoctor: z.string().max(200).optional(),
});

export type MedicationForm = z.infer<typeof medicationSchema>;

export const surgerySchema = z.object({
  procedureName: z.string().min(1).max(200),
  surgeryDate: z.string().optional(),
  hospitalName: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export type SurgeryForm = z.infer<typeof surgerySchema>;

export const chronicConditionSchema = z.object({
  conditionName: z.string().min(1).max(200),
  diagnosedDate: z.string().optional(),
  status: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

export type ChronicConditionForm = z.infer<typeof chronicConditionSchema>;

export const emergencyContactSchema = z.object({
  name: z.string().min(1).max(200),
  relationship: z.string().min(1).max(50),
  phone: z.string().min(1).max(20),
  email: z.string().email().optional().or(z.literal('')),
  primary: z.boolean().optional(),
});

export type EmergencyContactForm = z.infer<typeof emergencyContactSchema>;
