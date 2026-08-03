export interface ProfileSectionCallbacks {
  onSaveSuccess: (message: string) => void;
  onSaveError: (message: string) => void;
}

export type DoctorSectionId =
  | 'professional'
  | 'qualifications'
  | 'experience'
  | 'specialization'
  | 'consultation';
