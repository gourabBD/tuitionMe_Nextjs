import coreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Flat config. `eslint-config-next` v16 ships flat-config arrays directly, so
 * there is no need for the FlatCompat shim (which also breaks under ESLint 10).
 */
const eslintConfig = [
  ...coreWebVitals,
  {
    rules: {
      // Course covers and avatars are arbitrary remote URLs supplied by
      // instructors and students. Running them through next/image's optimizer
      // would turn this app into an open image proxy, so plain <img> is the
      // deliberate choice here.
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
];

export default eslintConfig;
