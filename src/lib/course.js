/**
 * Display helpers shared by the course card and detail views.
 *
 * Older records (or ones added through "Publish a course") may not carry the
 * richer fields newer seeded courses ship with. These fill in sensible but
 * *stable* fallbacks derived from the document id, so a given course always
 * looks the same on every render instead of jumping around with Math.random()
 * — and, importantly, renders identically on the server and the client so
 * hydration doesn't mismatch.
 */

const hashString = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getRating = (service) => {
  if (typeof service?.rating === "number") return service.rating;
  const seed = hashString(service?._id || service?.subject || "");
  return Math.round((3.9 + (seed % 11) / 10) * 10) / 10; // 3.9 – 4.9
};

export const getStudentCount = (service) => {
  if (typeof service?.students === "number") return service.students;
  const seed = hashString((service?._id || service?.subject || "") + "s");
  return 120 + (seed % 4800);
};

export const getCategory = (service) => service?.category || "General";

export const getLevel = (service) => service?.level || "All Levels";

export const formatStudents = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
};

export const getDiscount = (cost, originalCost) => {
  if (!originalCost || !cost || Number(originalCost) <= Number(cost)) return null;
  return Math.round(100 - (Number(cost) / Number(originalCost)) * 100);
};

const YOUTUBE_PATTERNS = [
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/watch\?v=([\w-]{11})/,
  /youtube\.com\/embed\/([\w-]{11})/,
];

/**
 * Turns a YouTube watch/share link into an embeddable one. Anything else
 * returns null and is rendered as a plain link instead of an iframe — we only
 * ever embed hosts we explicitly recognise.
 */
export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
};

export const averageReviewRating = (reviewList = []) => {
  const rated = reviewList.filter((r) => typeof r?.rating === "number");
  if (rated.length === 0) return null;
  const sum = rated.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
};

/** Deterministic placeholder avatar for users who never set a photo. */
export const avatarFor = (name) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "S")}`;
