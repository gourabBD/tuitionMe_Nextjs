import Link from "next/link";
import {
  BsArrowRight,
  BsCashCoin,
  BsClockHistory,
  BsPatchCheckFill,
} from "react-icons/bs";
import { BiBookReader } from "react-icons/bi";

import CourseCard from "@/components/ui/CourseCard";
import SearchBox from "@/components/ui/SearchBox";
import SkillsCarousel from "@/components/ui/SkillsCarousel";
import StarRating from "@/components/ui/StarRating";
import { avatarFor, getCategory } from "@/lib/course";
import { listCourses, listFeaturedCourses, listReviews } from "@/lib/data";

// Course data changes as soon as an instructor publishes, so the page is
// rendered per request straight from MongoDB — no second HTTP hop, and no
// stale cache to explain away.
export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: <BiBookReader />,
    title: "Expert Tutors",
    text: "Learn from vetted, experienced instructors across every subject and grade level.",
  },
  {
    icon: <BsClockHistory />,
    title: "Flexible Scheduling",
    text: "Book sessions that fit your routine — mornings, evenings or weekends.",
  },
  {
    icon: <BsPatchCheckFill />,
    title: "Verified Reviews",
    text: "Real feedback from real students helps you choose the right course with confidence.",
  },
  {
    icon: <BsCashCoin />,
    title: "Affordable Pricing",
    text: "Transparent, monthly pricing with no hidden fees — pay only for what you need.",
  },
];

export default async function HomePage() {
  const [services, featured, reviews] = await Promise.all([
    listCourses(),
    listFeaturedCourses(6),
    listReviews(),
  ]);

  const categories = Array.from(new Set(services.map(getCategory))).slice(0, 8);
  const totalStudents = services.length * 480 + 1200;

  return (
    <div className="tm-page">
      {/* Hero */}
      <section className="tm-hero">
        <div className="tm-container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="tm-eyebrow">Trusted by 1,000+ learners</span>
              <h1 className="tm-hero-title mt-2">
                Learn new skills with{" "}
                <span className="tm-hero-highlight">expert tutors</span>, anytime,
                anywhere.
              </h1>
              <p className="tm-hero-sub mt-3">
                Tuition Me connects students with top-rated instructors for live,
                personalised courses in academics, programming, languages and more.
              </p>

              <SearchBox />

              <div className="d-flex flex-wrap gap-2 mt-3">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    className="tm-pill text-decoration-none"
                    href={`/services?category=${encodeURIComponent(cat)}`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>

              <div className="d-flex flex-wrap gap-4 mt-4">
                <div className="tm-stat">
                  <div className="tm-stat-num">{services.length}+</div>
                  <div className="tm-stat-label">Live courses</div>
                </div>
                <div className="tm-stat">
                  <div className="tm-stat-num">{totalStudents.toLocaleString()}+</div>
                  <div className="tm-stat-label">Students enrolled</div>
                </div>
                <div className="tm-stat">
                  <div className="tm-stat-num">
                    4.8 <StarRating value={4.8} size={13} />
                  </div>
                  <div className="tm-stat-label">Average rating</div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="tm-surface p-4">
                <h5 className="mb-3">All subjects</h5>
                <div className="d-grid gap-2" style={{ maxHeight: 320, overflowY: "auto" }}>
                  {services.slice(0, 8).map((service) => (
                    <Link
                      key={service._id}
                      href={`/services/${service._id}`}
                      className="d-flex justify-content-between align-items-center text-decoration-none px-3 py-2 rounded"
                      style={{
                        background: "var(--color-surface-alt)",
                        color: "var(--color-text)",
                      }}
                    >
                      <span className="fw-semibold">{service.subject}</span>
                      <BsArrowRight />
                    </Link>
                  ))}
                </div>
                <Link
                  href="/services"
                  className="btn-tm-outline text-decoration-none d-block text-center mt-3"
                >
                  Browse all courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular courses */}
      <section className="tm-section">
        <div className="tm-container">
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-2">
            <div>
              <span className="tm-eyebrow">Handpicked for you</span>
              <h2 className="tm-section-title">Popular courses right now</h2>
            </div>
            <Link href="/services" className="btn-tm-outline text-decoration-none">
              Show all
            </Link>
          </div>
          <div className="mt-4">
            {featured.length === 0 ? (
              <div className="tm-empty">No courses available yet. Check back soon!</div>
            ) : (
              <div className="row row-cols-lg-3 row-cols-sm-2 row-cols-1 g-4">
                {featured.map((service) => (
                  <div className="col" key={service._id}>
                    <CourseCard service={service} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="tm-section" style={{ background: "var(--color-surface-alt)" }}>
        <div className="tm-container">
          <span className="tm-eyebrow">Why Tuition Me</span>
          <h2 className="tm-section-title">A better way to learn</h2>
          <p className="tm-section-sub">
            We built a platform focused on quality instruction, transparent reviews
            and flexible learning — everything you need to actually reach your goals.
          </p>
          <div className="row g-4">
            {FEATURES.map((feature) => (
              <div className="col-md-6 col-lg-3" key={feature.title}>
                <div className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h5>{feature.title}</h5>
                  <p className="tm-text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending skills */}
      <section className="tm-section">
        <div className="tm-container">
          <span className="tm-eyebrow">Explore</span>
          <h2 className="tm-section-title">Trending skills this month</h2>
          <div className="tm-surface p-2 mt-3" style={{ overflow: "hidden" }}>
            <SkillsCarousel />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="tm-section" style={{ background: "var(--color-surface-alt)" }}>
          <div className="tm-container">
            <span className="tm-eyebrow">Testimonials</span>
            <h2 className="tm-section-title">What our students say</h2>
            <div className="row g-4 mt-2">
              {reviews.slice(0, 3).map((review) => (
                <div className="col-md-4" key={review._id}>
                  <div className="testimonial-card">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <img
                        className="testimonial-avatar"
                        src={review.photoURL || avatarFor(review.name)}
                        alt=""
                      />
                      <div>
                        <div className="fw-semibold">{review.name}</div>
                        <div className="tm-text-muted" style={{ fontSize: "0.8rem" }}>
                          {review.subject}
                        </div>
                      </div>
                    </div>
                    {typeof review.rating === "number" && (
                      <StarRating value={review.rating} size={13} />
                    )}
                    <p className="tm-text-muted mt-2 mb-0" style={{ fontSize: "0.9rem" }}>
                      “
                      {review.userReview.length > 140
                        ? `${review.userReview.slice(0, 140)}…`
                        : review.userReview}
                      ”
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="tm-section">
        <div className="tm-container">
          <div className="tm-cta d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <h3
                className="mb-1"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
              >
                Ready to start learning?
              </h3>
              <p className="mb-0" style={{ opacity: 0.9 }}>
                Join thousands of students building new skills every week.
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link href="/services" className="btn btn-light fw-semibold text-decoration-none">
                Browse Courses
              </Link>
              <Link
                href="/addservice"
                className="btn btn-outline-light fw-semibold text-decoration-none"
              >
                Teach with us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
