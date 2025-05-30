import * as yup from "yup";

// Maximum file size in bytes (2MB)
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

// Common validation schema for both Guidance and Teacher forms
const commonSchema = yup.object().shape({
    username: yup
        .string()
        .required("Username is required")
        .min(4, "Username must be at least 4 characters")
        .matches(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores"
        ),

    email: yup
        .string()
        .email("Invalid email format")
        .required("Email is required"),

    password: yup
        .string()
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        .required("Password is required"),

    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),

    fullName: yup
        .string()
        .required("Full name is required")
        .min(2, "Full name must be at least 2 characters"),

    phoneNumber: yup
        .string()
        .required("Phone number is required")
        .matches(/^\+?[0-9\s\-\(\)]+$/, "Invalid phone number format"),

    profilePhoto: yup.mixed().required("Profile photo is required"),
});

// Guidance Counselor validation
export const staffSchema = commonSchema;


// Helper function to validate file
export const validateProfilePhoto = (file: File | null): string | undefined => {
    if (!file) {
        return "Profile photo is required";
    }

    // Check file size
    if (file.size > MAX_PHOTO_SIZE) {
        return "Profile photo must be less than 2MB";
    }

    // Check file type
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        return "Profile photo must be in JPG or PNG format";
    }

    return undefined;
};

// Validation function for Guidance Counselor form
export const validateStaffForm = async (
    formData: any
): Promise<Record<string, string>> => {
    try {
        await staffSchema.validate(formData, { abortEarly: false });

        // Handle file validation separately
        const errors: Record<string, string> = {};
        const photoError = validateProfilePhoto(formData.profilePhoto);

        if (photoError) {
            errors.profilePhoto = photoError;
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
