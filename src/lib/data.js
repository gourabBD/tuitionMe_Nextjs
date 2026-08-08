import "server-only";
import { ObjectId } from "mongodb";
import { enrollments, reviews, services } from "./mongodb";
import { PUBLIC_COURSE_PROJECTION, toCourse, toReview } from "./serialize";
import { escapeRegex } from "./validation";

/**
 * Read-side data access, shared by Server Components and route handlers.
 * Rendering a page goes straight to MongoDB instead of the page fetching its
 * own HTTP API — one fewer network hop, and no second hostname that has to be
 * reachable for the page to work.
 */

export function toObjectId(id) {
  return ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id) ? new ObjectId(id) : null;
}

export async function listCourses(query = {}) {
  const filter = {};

  if (query.search) {
    // Escaped: the raw term must never become regex syntax.
    const term = escapeRegex(query.search);
    filter.$or = [
      { subject: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
    ];
  }
  if (query.category) {
    filter.category = {
      $regex: `^${escapeRegex(query.category)}$`,
      $options: "i",
    };
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.cost = {};
    if (query.minPrice !== undefined) filter.cost.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.cost.$lte = query.maxPrice;
  }

  let sort = { createdAt: -1 };
  if (query.sort === "rating") sort = { rating: -1 };
  else if (query.sort === "price-asc") sort = { cost: 1 };
  else if (query.sort === "price-desc") sort = { cost: -1 };

  const col = await services();
  const docs = await col
    .find(filter, { projection: PUBLIC_COURSE_PROJECTION })
    .sort(sort)
    // Hard ceiling so a crafted `limit` can never ask for the whole collection.
    .limit(Math.min(query.limit ?? 200, 200))
    .toArray();

  return docs.map(toCourse);
}

export async function listFeaturedCourses(limit = 6) {
  const col = await services();
  const docs = await col
    .find({}, { projection: PUBLIC_COURSE_PROJECTION })
    .sort({ bestseller: -1, rating: -1, createdAt: -1 })
    .limit(Math.min(limit, 24))
    .toArray();
  return docs.map(toCourse);
}

export async function listCategories() {
  const col = await services();
  const values = await col.distinct("category");
  return values.filter((v) => typeof v === "string" && v.length > 0).sort();
}

export async function getCourse(id) {
  const _id = toObjectId(id);
  if (!_id) return null;
  const col = await services();
  const doc = await col.findOne({ _id }, { projection: PUBLIC_COURSE_PROJECTION });
  return doc ? toCourse(doc) : null;
}

/** Full document including lesson content. Callers must gate access themselves. */
export async function getCourseWithContent(id) {
  const _id = toObjectId(id);
  if (!_id) return null;
  const col = await services();
  return col.findOne({ _id });
}

export async function listCoursesByInstructor(email) {
  const col = await services();
  const docs = await col
    .find({ instructorEmail: email }, { projection: PUBLIC_COURSE_PROJECTION })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(toCourse);
}

export async function listReviews(serviceId) {
  const col = await reviews();
  const filter = serviceId ? { serviceId } : {};
  const docs = await col.find(filter).sort({ createdAt: -1 }).limit(200).toArray();
  return docs.map(toReview);
}

export async function listReviewsByAuthor(email) {
  const col = await reviews();
  const docs = await col.find({ email }).sort({ createdAt: -1 }).toArray();
  return docs.map(toReview);
}

export async function getReview(id) {
  const _id = toObjectId(id);
  if (!_id) return null;
  const col = await reviews();
  const doc = await col.findOne({ _id });
  return doc ? toReview(doc) : null;
}

export async function isEnrolled(email, serviceId) {
  const col = await enrollments();
  const doc = await col.findOne({ email, serviceId, status: "paid" });
  return Boolean(doc);
}

export async function listEnrolledCourseIds(email) {
  const col = await enrollments();
  const docs = await col.find({ email, status: "paid" }).toArray();
  return docs.map((d) => d.serviceId);
}

/**
 * The single place that decides whether someone may see a course's paid
 * lessons. Both the detail page and the content API go through here so the two
 * can't drift apart — the old server duplicated this check in two handlers.
 *
 * @returns {Promise<{state:"locked",reason:string}|{state:"owner"|"enrolled",lessons:import('./types').Lesson[]}>}
 */
export async function resolveCourseAccess(courseId, viewerEmail) {
  if (!viewerEmail) return { state: "locked", reason: "anonymous" };

  const doc = await getCourseWithContent(courseId);
  if (!doc) return { state: "locked", reason: "not-found" };

  const lessons = (doc.content || []).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    url: item.url,
  }));

  if (doc.instructorEmail && doc.instructorEmail === viewerEmail) {
    return { state: "owner", lessons };
  }

  if (await isEnrolled(viewerEmail, courseId)) {
    return { state: "enrolled", lessons };
  }

  return { state: "locked", reason: "not-enrolled" };
}
