export interface FilePreview {
  uploadPhoto: string | null;
  signature: string | null;
}

export type StaffRegistrationForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  profilePhoto: File | null;
};

export type TeacherRegistrationForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  profilePhoto: File | null;
};

export type AdminProps = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export type StaffFormErrors = {
  [K in keyof StaffRegistrationForm]?: string;
};

export interface FilePreviewForStaff {
  profilePhoto: string | null;
}

export type FormErrorsState = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
};

// Batch interface based on mobile app session form
export interface Batch {
  id: string; // Format: BF-YYYYMMDD-XXX
  date: string; // Session date
  species: string; // Fish species
  location: string; // Location field
  notes?: string; // Notes about the session
  totalFingerlings: number; // For distribution tracking
  remainingFingerlings: number; // For distribution tracking
}
