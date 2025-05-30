import * as yup from "yup";

// Define maximum file sizes in bytes
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_SIGNATURE_SIZE = 1 * 1024 * 1024; // 1MB

// Form validation schemas for each step
export const personalInfoSchema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup
        .string()
        .email("Invalid email format")
        .required("Email is required"),
    password: yup
        .string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    dateOfBirth: yup.string().required("Date of birth is required"),
    phoneNumber: yup.string().required("Phone number is required"),
});

export const addressSchema = yup.object().shape({
    address: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
    zipCode: yup.string().required("ZIP code is required"),
});

export const educationSchema = yup.object().shape({
    course: yup.string().required("Course is required"),
    academicYear: yup.string().required("Academic year is required"),
    previousSchool: yup.string(),
});

export const guardianSchema = yup.object().shape({
    guardianName: yup.string().required("Guardian name is required"),
    guardianEmail: yup
        .string()
        .email("Invalid email format")
        .required("Guardian email is required"),
    guardianPhoneNumber: yup
        .string()
        .required("Guardian phone number is required"),
});

// For file validation, we'll use custom logic since Yup doesn't handle File objects well
export const documentsSchema = yup.object().shape({
    // We'll implement file validation in a separate function
    // These are just placeholders for the required fields
    uploadPhoto: yup.mixed().required("Photo is required"),
    signature: yup.mixed().required("Signature is required"),
});

// Helper function to validate files
export const validateFiles = (files: {
    uploadPhoto: File | null;
    signature: File | null;
}): Record<string, string | undefined> => {
    const errors: Record<string, string | undefined> = {};

    // Check if photo is provided
    if (!files.uploadPhoto) {
        errors.uploadPhoto = "Photo is required";
    } else {
        // Check photo file size
        if (files.uploadPhoto.size > MAX_PHOTO_SIZE) {
            errors.uploadPhoto = "Photo file size must be less than 2MB";
        }

        // Check photo file type
        if (
            !["image/jpeg", "image/jpg", "image/png"].includes(files.uploadPhoto.type)
        ) {
            errors.uploadPhoto = "Photo must be in JPG or PNG format";
        }
    }

    // Check if signature is provided
    if (!files.signature) {
        errors.signature = "Signature is required";
    } else {
        // Check signature file size
        if (files.signature.size > MAX_SIGNATURE_SIZE) {
            errors.signature = "Signature file size must be less than 1MB";
        }

        // Check signature file type
        if (
            !["image/jpeg", "image/jpg", "image/png"].includes(files.signature.type)
        ) {
            errors.signature = "Signature must be in JPG or PNG format";
        }
    }

    return errors;
};

// Function to validate a specific step
export const validateStep = async (
    step: number,
    data: any,
    files?: { uploadPhoto: File | null; signature: File | null }
): Promise<Record<string, string>> => {
    try {
        let errors: Record<string, string> = {};

        switch (step) {
            case 1:
                await personalInfoSchema.validate(data, { abortEarly: false });
                break;
            case 2:
                await addressSchema.validate(data, { abortEarly: false });
                break;
            case 3:
                await educationSchema.validate(data, { abortEarly: false });
                break;
            case 4:
                await guardianSchema.validate(data, { abortEarly: false });
                break;
            case 5:
                if (files) {
                    errors = validateFiles(files) as Record<string, string>;
                }
                break;
            default:
                break;
        }

        return errors;
    } catch (err) {
        if (err instanceof yup.ValidationError) {
            const validationErrors: Record<string, string> = {};
            err.inner.forEach((error) => {
                if (error.path) {
                    validationErrors[error.path] = error.message;
                }
            });
            return validationErrors;
        }
        return {};
    }
};

export default validateStep;

// Login validation schema
export const loginSchema = yup.object({
    email: yup
        .string()
        .required("Email is required")
        .email("Email is invalid")
        .trim(),
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
});

// Infer the TypeScript type from the schema
export type LoginFormData = yup.InferType<typeof loginSchema>;

import { ValidationError } from "yup";
import { AnyObjectSchema } from "yup";

type ValidationErrors = {
    [key: string]: string;
};

/**
 * Validates form data against a yup schema
 * @param schema - The yup validation schema
 * @param formData - The data to validate
 * @returns Object with isValid flag and any validation errors
 */

export const validateForm = async <T extends Record<string, any>>(
    schema: AnyObjectSchema,
    formData: T
): Promise<{
    isValid: boolean;
    errors: ValidationErrors;
}> => {
    try {
        // Validate and transform the data
        await schema.validate(formData, { abortEarly: false });

        // If validation passes
        return {
            isValid: true,
            errors: {},
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            // Convert Yup's validation errors to a more usable format
            const errors: ValidationErrors = {};

            error.inner.forEach((err) => {
                if (err.path) {
                    errors[err.path] = err.message;
                }
            });

            return {
                isValid: false,
                errors,
            };
        }

        // For unexpected errors, return a general error
        return {
            isValid: false,
            errors: { general: "An unexpected error occurred during validation" },
        };
    }
};
