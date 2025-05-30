import { LoginFormData } from "../validation/loginSchema";

export type FormState = LoginFormData & {
  rememberMe: boolean;
};

export type FormErrors = {
  [K in keyof FormState | "general"]?: string;
};
