import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import { getClient } from "@/lib/mongodb";
import { mongoDbName } from "@/lib/env";
import { verifyCredentials } from "@/lib/users";
import { credentialsSchema } from "@/lib/validation";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * Two ways in:
 *   • Google OAuth — only registered when the client id/secret are present, so
 *     a deployment without them still boots and offers password sign-in.
 *   • Credentials — email + bcrypt-hashed password stored in the same `users`
 *     collection the adapter manages.
 *
 * Sessions use the JWT strategy because the Credentials provider requires it.
 * The token is encrypted (JWE) by Auth.js and stored in an HttpOnly, SameSite
 * cookie, so it is neither readable nor forgeable from the browser.
 */

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

const providers = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      // Returning null (never throwing) keeps every failure mode — malformed
      // input, unknown email, wrong password — indistinguishable to the caller.
      if (!parsed.success) return null;

      return verifyCredentials(parsed.data.email, parsed.data.password);
    },
  }),
];

if (googleConfigured) {
  providers.push(
    Google({
      // Ask Google to re-prompt for account choice rather than silently
      // reusing whichever account the browser happens to be signed into.
      authorization: { params: { prompt: "select_account" } },
      allowDangerousEmailAccountLinking: false,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // The adapter persists Google users (and their linked accounts) into Mongo.
  // With the JWT strategy it is not consulted on every request, so it costs
  // nothing on the hot path.
  //
  // Passed as a *function* rather than a promise so nothing connects — or even
  // reads MONGODB_URI — at import time. `next build` imports this module while
  // collecting page data, and a Docker build has no database credentials.
  adapter: MongoDBAdapter(() => getClient(), { databaseName: mongoDbName() }),

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,
  },

  // Behind a proxy (Vercel, Fly, Render) Auth.js needs to be told the
  // forwarded host is trustworthy in order to build correct callback URLs.
  trustHost: true,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers,

  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the sign-in request itself.
      if (user) {
        token.uid = user.id;
        token.picture = user.image ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid ?? token.sub;
        session.user.image = token.picture ?? null;
      }
      return session;
    },

    /**
     * Keeps post-login redirects on this origin. Auth.js already defaults to
     * this, but stating it explicitly means a future `callbackUrl` change
     * can't quietly turn the login page into an open redirect.
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Not a URL at all — fall through to the safe default.
      }
      return baseUrl;
    },
  },
});

export { googleConfigured };
