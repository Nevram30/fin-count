import { AdminProps, StaffRegistrationForm } from "../types/data.types";

export const InitialStaffFormState: StaffRegistrationForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  phoneNumber: "",
  profilePhoto: null,
};

export const initialState: AdminProps = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};
