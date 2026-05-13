import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db-direct";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const users = await query(
          `SELECT id, name, email, password_hash, role, email_verified FROM users WHERE email = $1`,
          [credentials.email]
        );

        const user = (users as any[])[0];

        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isValid) {
          throw new Error("Senha incorreta");
        }

        if (!user.email_verified) {
          throw new Error("CONFIRM_EMAIL_REQUIRED");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};