import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "react-bootstrap/Button";
import {
  BsAward,
  BsBarChartFill,
  BsCalendarWeek,
  BsCheckCircleFill,
  BsClockHistory,
  BsLockFill,
  BsPatchCheckFill,
  BsPeopleFill,
} from "react-icons/bs";

import EnrollPanel from "@/components/course/EnrollPanel";
import LessonList from "@/components/course/LessonList";
import ReviewBody from "@/components/ui/ReviewBody";
import StarRating from "@/components/ui/StarRating";
import { getSession } from "@/lib/auth";
import {
  averageReviewRating,
  formatStudents,
  getCategory,
  getDiscount,
  getLevel,
  getRating,
  getStudentCount,
} from "@/lib/course";
import { getCourse, listReviews, resolveCourseAccess } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) return { title: "Course not found" };

  return {
    title: course.subject,
    description: course.description.slice(0, 160),
    openGraph: {
      title: course.subject,
      description: course.description.slice(0, 160),
      images: course.img ? [course.img] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }) {
  const { id } = await params;

  const course = await getCourse(id);
  if (!course) notFound();

  const user = await getSession();

  // Access is decided on the server, so locked lesson URLs are never sent to
  // the browser at all — there is nothing in the payload to un-hide with
  // devtools, which is what a purely client-side gate would leave exposed.
  const [reviews, access] = await Promise.all([
    listReviews(id),
    resolveCourseAccess(id, user?.email ?? null),
  ]);

  const isOwner = access.state === "owner";
  const unlocked = access.state !== "locked";
  const rating = averageReviewRating(reviews) ?? getRating(course);
  const students = getStudentCount(course);
  const discount = getDiscount(course.cost, course.originalCost);

  return (
    <div className="tm-page">
      <div className="tm-detail-hero">
        <div className="tm-container">
          <nav className="tm-breadcrumb mb-2" style={{ fontSize: "0.85rem" }}>
            <Link href="/services">Courses</Link>
            <span className="mx-2">/</span>
            <Link href={`/services?category=${encodeURIComponent(getCategory(course))}`}>
              {getCategory(course)}
            </Link>
          </nav>
          <div className="row">
            <div className="col-lg-8">
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "clamp(1.6rem,1.3rem + 1.5vw,2.4rem)",
                }}
              >
                {course.subject}
              </h1>
              <p style={{ opacity: 0.85, maxWidth: 680 }}>{course.description}</p>
              <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
                <span className="d-inline-flex align-items-center gap-2">
                  <strong style={{ color: "#f5a623" }}>{rating.toFixed(1)}</strong>
                  <StarRating value={rating} />
                  <span style={{ opacity: 0.75 }}>
                    ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                  </span>
                </span>
                <span
                  className="d-inline-flex align-items-center gap-1"
                  style={{ opacity: 0.85 }}
                >
                  <BsPeopleFill /> {formatStudents(students)} students
                </span>
                <span
                  className="d-inline-flex align-items-center gap-1"
                  style={{ opacity: 0.85 }}
                >
                  <BsBarChartFill /> {getLevel(course)}
                </span>
              </div>
              <p className="mt-2 mb-0" style={{ opacity: 0.85 }}>
                Taught by <strong>{course.instructor || "Tuition Me Faculty"}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="tm-container">
        <div className="row tm-detail-overlap">
          <div className="col-lg-8 order-2 order-lg-1 mt-4 mt-lg-0">
            <div className="tm-surface p-3 p-md-4">
              <img
                src={course.img}
                alt={course.subject}
                className="w-100"
                style={{
                  maxHeight: 420,
                  objectFit: "cover",
                  borderRadius: "var(--radius-md)",
                }}
              />

              <h4 className="mt-4">What you get</h4>
              <div className="row g-3 mt-1">
                <div className="col-6 col-md-3 d-flex align-items-center gap-2">
                  <BsCalendarWeek className="text-primary" /> {course.days} days/week
                </div>
                <div className="col-6 col-md-3 d-flex align-items-center gap-2">
                  <BsClockHistory className="text-primary" /> Flexible timing
                </div>
                <div className="col-6 col-md-3 d-flex align-items-center gap-2">
                  <BsPatchCheckFill className="text-primary" /> Verified tutor
                </div>
                <div className="col-6 col-md-3 d-flex align-items-center gap-2">
                  <BsAward className="text-primary" /> Certificate
                </div>
              </div>

              <h4 className="mt-4">Description</h4>
              <p className="tm-text-muted" style={{ whiteSpace: "pre-wrap" }}>
                {course.description}
              </p>
              <p className="tm-text-muted mb-0">
                Recommended for students of <strong>{course.class}</strong>.
              </p>
            </div>

            <div className="tm-surface p-3 p-md-4 mt-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                <h4 className="mb-0">Course content</h4>
                {isOwner && (
                  <Link
                    href={`/manage/${course._id}`}
                    className="btn-tm-outline text-decoration-none"
                  >
                    Manage lessons
                  </Link>
                )}
              </div>

              {unlocked ? (
                <>
                  <div
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: "var(--color-accent)" }}
                  >
                    <BsCheckCircleFill />
                    <span className="fw-semibold">
                      You have full access to this course
                    </span>
                  </div>
                  <LessonList lessons={access.lessons} />
                </>
              ) : (
                <div className="tm-empty py-4">
                  <BsLockFill size={28} className="mb-2 tm-text-muted" />
                  <p className="mb-0">
                    {user
                      ? "Purchase this course to unlock its video lessons and PDFs."
                      : "Login and purchase this course to unlock its lessons."}
                  </p>
                </div>
              )}
            </div>

            <div className="tm-surface p-3 p-md-4 mt-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h4 className="mb-0">
                  Student reviews{" "}
                  <span className="tm-text-muted" style={{ fontSize: "1rem" }}>
                    ({reviews.length})
                  </span>
                </h4>
                {user ? (
                  <Link href={`/myreviews/${course._id}`}>
                    <Button className="btn-tm-outline border-0">Write a review</Button>
                  </Link>
                ) : (
                  <Link
                    href={`/login?next=${encodeURIComponent(`/services/${course._id}`)}`}
                    className="tm-text-muted"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Login to write a review
                  </Link>
                )}
              </div>

              <div className="row g-3 mt-1">
                {reviews.length === 0 ? (
                  <div className="tm-empty py-4">Be the first to review this course.</div>
                ) : (
                  reviews.map((review) => (
                    <div className="col-md-6" key={review._id}>
                      <ReviewBody review={review} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 order-1 order-lg-2">
            <div
              className="tm-sidebar-card p-4"
              style={{ position: "sticky", top: "calc(var(--nav-height) + 16px)" }}
            >
              <div className="d-flex align-items-baseline gap-2">
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                    fontSize: "1.9rem",
                  }}
                >
                  ৳{course.cost}
                </span>
                <span className="tm-text-muted">/month</span>
              </div>
              {discount !== null && (
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="course-price-original">৳{course.originalCost}</span>
                  <span className="course-price-off">{discount}% off</span>
                </div>
              )}

              {/* useSearchParams needs a Suspense boundary above it. */}
              <Suspense fallback={<div style={{ height: 44 }} />}>
                <EnrollPanel
                  courseId={course._id}
                  cost={course.cost}
                  hasAccess={unlocked}
                  isOwner={isOwner}
                />
              </Suspense>

              <p className="text-center tm-text-muted mb-3" style={{ fontSize: "0.8rem" }}>
                Secure payment via Stripe. No hidden fees.
              </p>

              <hr className="tm-divider" />

              <ul className="list-unstyled d-grid gap-2 mb-0" style={{ fontSize: "0.9rem" }}>
                <li className="d-flex justify-content-between">
                  <span className="tm-text-muted">Category</span>
                  <strong>{getCategory(course)}</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span className="tm-text-muted">Level</span>
                  <strong>{getLevel(course)}</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span className="tm-text-muted">Class</span>
                  <strong>{course.class}</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span className="tm-text-muted">Schedule</span>
                  <strong>{course.days} days / week</strong>
                </li>
                <li className="d-flex justify-content-between">
                  <span className="tm-text-muted">Students</span>
                  <strong>{formatStudents(students)}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="tm-section" />
    </div>
  );
}
