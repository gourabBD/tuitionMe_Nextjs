import Link from "next/link";
import { BsPeopleFill } from "react-icons/bs";

import StarRating from "./StarRating";
import {
  formatStudents,
  getCategory,
  getDiscount,
  getLevel,
  getRating,
  getStudentCount,
} from "@/lib/course";

/**
 * The course tile used on the home page and the full catalogue, so both stay
 * visually consistent.
 */
export default function CourseCard({ service }) {
  if (!service) return null;

  const rating = getRating(service);
  const students = getStudentCount(service);
  const discount = getDiscount(service.cost, service.originalCost);
  const description = service.description || "";

  return (
    <Link href={`/services/${service._id}`} className="course-card">
      <div className="course-card-media">
        <img src={service.img} alt={service.subject} loading="lazy" />
        {service.bestseller ? (
          <span className="course-badge bestseller">Bestseller</span>
        ) : (
          <span className="course-badge new">New</span>
        )}
        <span className="course-level">{getLevel(service)}</span>
      </div>
      <div className="course-card-body">
        <span className="course-category">{getCategory(service)}</span>
        <h3 className="course-title">{service.subject}</h3>
        <p className="course-instructor mb-0">
          {service.instructor || "Tuition Me Faculty"}
        </p>
        <div className="course-rating">
          <span className="rating-num">{rating.toFixed(1)}</span>
          <StarRating value={rating} />
          <span className="rating-count d-none d-sm-inline">
            <BsPeopleFill className="me-1" />
            {formatStudents(students)} students
          </span>
        </div>
        <p className="tm-text-muted mb-0" style={{ fontSize: "0.85rem" }}>
          {description.length > 90 ? `${description.slice(0, 90)}…` : description}
        </p>
        <div className="course-price-row">
          <span className="course-price">৳{service.cost}/mo</span>
          {discount !== null && (
            <>
              <span className="course-price-original">৳{service.originalCost}</span>
              <span className="course-price-off">{discount}% off</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
