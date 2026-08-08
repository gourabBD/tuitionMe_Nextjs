import { z } from "zod";

/**
 * Only http(s) URLs are ever accepted or rendered. Without this a lesson or
 * cover image URL of `javascript:...` / `data:text/html,...` would become
 * stored XSS the moment it is put in an `href` or `src`.
 */
export const httpUrl = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") return false;
      // Embedded credentials are never legitimate here and confuse users about
      // where a link actually points.
      if (url.username || url.password) return false;
      return true;
    } catch {
      return false;
    }
  }, "Must be a valid http(s) URL");

/**
 * True when the string contains C0/DEL control characters. Those let text
 * smuggle line breaks into logs and zero bytes into downstream consumers, and
 * no legitimate course title or category needs them.
 */
function hasControlChars(value) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

const plainText = (max) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((v) => !hasControlChars(v), "Contains invalid characters");

/** Multi-line free text: newlines and tabs are fine, other control bytes are not. */
const richText = (max) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine(
      (v) => !hasControlChars(v.replace(/[\r\n\t]/g, " ")),
      "Contains invalid characters"
    );

export const objectIdString = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createCourseSchema = z.object({
  subject: plainText(140),
  category: plainText(60),
  instructor: plainText(80),
  img: httpUrl,
  description: richText(4000),
  class: plainText(60),
  days: plainText(40),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "All Levels"]),
  cost: z.coerce.number().int().min(1).max(1_000_000),
  originalCost: z.coerce.number().int().min(1).max(1_000_000).optional(),
});

export const lessonSchema = z.object({
  type: z.enum(["video", "pdf"]),
  title: plainText(160),
  url: httpUrl,
});

export const createReviewSchema = z.object({
  serviceId: objectIdString,
  userReview: richText(2000),
  rating: z.coerce.number().int().min(1).max(5),
});

export const updateReviewSchema = z
  .object({
    userReview: richText(2000).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
  })
  .refine(
    (v) => v.userReview !== undefined || v.rating !== undefined,
    "Nothing to update"
  );

export const checkoutSchema = z.object({
  serviceId: objectIdString,
});

export const verifyCheckoutSchema = z.object({
  sessionId: z
    .string()
    .trim()
    .min(10)
    .max(200)
    .regex(/^cs_[A-Za-z0-9_]+$/, "Invalid session id"),
});

/**
 * bcrypt only hashes the first 72 *bytes* of a password and silently ignores
 * the rest, which would make two different long passwords interchangeable.
 * Capping the input at 72 makes that limit explicit instead of surprising.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

export const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

export const registerSchema = z.object({
  name: plainText(80),
  email: z.string().trim().email().max(254),
  password: passwordSchema,
  image: httpUrl.optional().or(z.literal("").transform(() => undefined)),
});

export const courseQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  minPrice: z.coerce.number().min(0).max(1_000_000).optional(),
  maxPrice: z.coerce.number().min(0).max(1_000_000).optional(),
  sort: z.enum(["rating", "price-asc", "price-desc", "newest"]).optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
});

/**
 * Escapes a user string before it goes anywhere near `$regex`.
 *
 * The previous Express server interpolated the raw search term straight into a
 * regular expression, which let a visitor hand the database a catastrophically
 * backtracking pattern and stall the query engine.
 */
export function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Formats a ZodError into a single human-readable sentence. */
export function firstIssue(error) {
  const issue = error.issues[0];
  if (!issue) return "Invalid request";
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}
