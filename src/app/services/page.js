import { Suspense } from "react";
import Link from "next/link";

import SortSelect from "@/components/catalogue/SortSelect";
import CourseCard from "@/components/ui/CourseCard";
import { listCategories, listCourses } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All courses",
  description: "Browse every subject taught by our verified tutors on Tuition Me.",
};

const first = (value) => (Array.isArray(value) ? value[0] : value) ?? "";

const SORTS = ["rating", "price-asc", "price-desc"];

export default async function ServicesPage({ searchParams }) {
  const params = await searchParams;
  const search = first(params.search).slice(0, 120);
  const category = first(params.category).slice(0, 60);
  const sortParam = first(params.sort);
  const sort = SORTS.includes(sortParam) ? sortParam : undefined;

  // Filtering happens in the database rather than in the browser, so a large
  // catalogue doesn't have to be shipped to the client just to be thrown away.
  const [courses, categories] = await Promise.all([
    listCourses({
      search: search || undefined,
      category: category || undefined,
      sort,
    }),
    listCategories(),
  ]);

  const pillHref = (cat) => {
    const next = new URLSearchParams();
    if (search) next.set("search", search);
    if (cat) next.set("category", cat);
    if (sortParam) next.set("sort", sortParam);
    const query = next.toString();
    return query ? `/services?${query}` : "/services";
  };

  return (
    <div className="tm-page tm-section">
      <div className="tm-container">
        <span className="tm-eyebrow">Catalogue</span>
        <h1 className="tm-section-title">All courses</h1>
        <p className="tm-section-sub">
          {search ? (
            <>
              Showing results for <strong>&ldquo;{search}&rdquo;</strong>
            </>
          ) : (
            "Browse every subject taught by our verified tutors."
          )}
        </p>

        <div className="d-flex flex-wrap gap-2 mb-2">
          <Link
            className={`tm-pill text-decoration-none ${!category ? "active" : ""}`}
            href={pillHref("")}
          >
            All categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              className={`tm-pill text-decoration-none ${category === cat ? "active" : ""}`}
              href={pillHref(cat)}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 my-3">
          <span className="tm-text-muted">
            {courses.length} course{courses.length !== 1 ? "s" : ""} found
          </span>
          {/* useSearchParams needs a Suspense boundary above it. */}
          <Suspense fallback={null}>
            <SortSelect value={sortParam || "relevance"} />
          </Suspense>
        </div>

        {courses.length === 0 ? (
          <div className="tm-empty">
            <h4>No courses matched your search</h4>
            <p>Try a different keyword or clear the category filter.</p>
          </div>
        ) : (
          <div className="row row-cols-lg-3 row-cols-sm-2 row-cols-1 g-4">
            {courses.map((course) => (
              <div className="col" key={course._id}>
                <CourseCard service={course} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
