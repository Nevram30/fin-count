import * as yup from "yup";
import * as bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";

import authschema from "@/app/validation/auth.schema";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import models from "../database/models";
import { signJwtAccessToken } from "../jwt";

export const options: NextAuthOptions = {
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // GoogleProvider configuration commented out

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "checkbox" },
      },
      async authorize(credentials: any): Promise<any> {
        if (!credentials) {
          return null;
        }

        const { email, password } = credentials;

        try {
          // Validate form data with Yup schema
          authschema.validateSync({ email, password }, { abortEarly: false });

          // Find user by email
          const user = await models.User.findOne({
            where: { email: email },
          });

          if (!user) {
            throw new Error(
              JSON.stringify({
                success: false,
                error: {
                  general: "Invalid email or password",
                },
              })
            );
          }

          // CRITICAL FIX: Properly check the password using await
          // The original code didn't properly await the bcrypt compare result
          if (!user.password) {
            throw new Error(
              JSON.stringify({
                success: false,
                error: {
                  general: "Account exists but has no password set",
                },
              })
            );
          }

          // Proper password comparison with bcrypt
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            throw new Error(
              JSON.stringify({
                success: false,
                error: {
                  password: "Invalid password",
                },
              })
            );
          }

          // Remove password from user object
          const { password: pass, ..._userWithoutPass } = user.toJSON();
          const userWithoutPass = {
            ..._userWithoutPass,
          };

          // Sign JWT token
          const accessToken = signJwtAccessToken(userWithoutPass);

          // Return user with token
          return {
            ...userWithoutPass,
            accessToken,
          };
        } catch (error) {
          // Handle Yup validation errors
          if (error instanceof yup.ValidationError) {
            let errors = {};
            error.inner.forEach((result) => {
              errors = { ...errors, [result.path as any]: result.message };
            });

            throw new Error(
              JSON.stringify({
                success: false,
                error: errors,
              })
            );
          }

          // Handle other errors
          // Check if the error is already formatted as JSON
          if (error instanceof Error && error.message.startsWith("{")) {
            throw error;
          }

          // Format other errors
          throw new Error(
            JSON.stringify({
              success: false,
              error: {
                general:
                  error instanceof Error
                    ? error.message
                    : "Authentication failed",
              },
              status: 500,
            })
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const { token: tokenData } = token as any;
      if (user && token) {
        const { id, userType } = user as any;
        return { token: tokenData, user: { id, userType } };
      }
      return token;
    },
    async session({ session, token }) {
      return { ...session, user: findUser(token) as any };
    },
  },
};

function findUser(object: Record<string, any>): any | null {
  for (const key in object) {
    if (key === "user" && object.user && object.user.userType) {
      return object[key];
    } else if (typeof object[key] === "object") {
      const result = findUser(object[key]);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
