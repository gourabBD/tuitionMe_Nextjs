import "server-only";

/**
 * Mongo documents contain ObjectId/Date instances that a Server Component
 * cannot hand to a Client Component. These narrow them to plain JSON — and,
 * just as importantly, act as an allowlist: `content` (the paid lesson list)
 * has no field here, so it can never leak into a public payload by accident.
 */

const isoOrEpoch = (value) =>
  (value instanceof Date ? value : new Date(0)).toISOString();

/** @returns {import('./types').Course} */
export function toCourse(doc) {
  return {
    _id: doc._id.toString(),
    subject: doc.subject,
    category: doc.category ?? "General",
    instructor: doc.instructor ?? "Tuition Me Faculty",
    instructorEmail: doc.instructorEmail ?? null,
    img: doc.img,
    description: doc.description ?? "",
    class: doc.class ?? "",
    days: doc.days ?? "",
    level: doc.level ?? "All Levels",
    cost: Number(doc.cost) || 0,
    originalCost:
      typeof doc.originalCost === "number" ? doc.originalCost : undefined,
    bestseller: Boolean(doc.bestseller),
    rating: typeof doc.rating === "number" ? doc.rating : undefined,
    students: typeof doc.students === "number" ? doc.students : undefined,
    createdAt: isoOrEpoch(doc.createdAt),
  };
}

/** @returns {import('./types').Review} */
export function toReview(doc) {
  return {
    _id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    photoURL: doc.photoURL ?? null,
    userReview: doc.userReview,
    rating: typeof doc.rating === "number" ? doc.rating : undefined,
    serviceId: doc.serviceId,
    subject: doc.subject,
    createdAt: isoOrEpoch(doc.createdAt),
  };
}

/** Projection that strips paid lesson content from any course query. */
export const PUBLIC_COURSE_PROJECTION = { content: 0 };
