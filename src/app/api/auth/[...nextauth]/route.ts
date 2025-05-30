import { options } from "@/server/utils/auth.options";
import NextAuth from "next-auth/next";

const authHandler = NextAuth(options);

export { authHandler as GET, authHandler as POST };
