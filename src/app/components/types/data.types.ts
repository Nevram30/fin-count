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
