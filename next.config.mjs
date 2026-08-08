const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * Course covers, avatars and lesson PDFs are arbitrary user-supplied URLs, so
 * `img-src` has to stay permissive — but everything that can actually execute
 * or exfiltrate (`script-src`, `connect-src`, `frame-ancestors`, `object-src`)
 * is locked down to this origin plus the two services the app genuinely talks
 * to: Google (OAuth sign-in) and Stripe (checkout).
 *
 * `'unsafe-inline'` is granted to `style-src` because Bootstrap and the ported
 * components rely on inline `style={{...}}` attributes, and to `script-src`
 * because Next.js emits an inline hydration payload. `'unsafe-eval'` is added
 * in development only — Turbopack's dev runtime needs it, production does not.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://accounts.google.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com",
  "frame-src 'self' https://accounts.google.com https://www.youtube.com https://youtube.com https://js.stripe.com",
  // Sign-in POSTs to this origin; Auth.js then redirects on to Google, and
  // Stripe Checkout is a hosted page on their domain.
  "form-action 'self' https://accounts.google.com https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a self-contained server bundle so the Dockerfile can ship a tiny
  // runtime image.
  //
  // Skipped on Vercel: it builds its own function bundles and layers a config
  // of its own on top, and the combination fails looking for a trace manifest
  // (`.next/next-server.js.nft.json`) that standalone mode doesn't emit there.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  serverExternalPackages: ["mongodb"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // API responses are per-user and must never be cached by a CDN or a
      // shared proxy — several of them are gated on the session cookie.
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
