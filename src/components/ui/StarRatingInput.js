"use client";

import { useState } from "react";
import { BsStar, BsStarFill } from "react-icons/bs";

/** Interactive 1–5 star picker used on the review forms. */
export default function StarRatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const active = hover || value || 0;

  return (
    <div className="star-rating-input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          tabIndex={0}
          className={n <= active ? "filled" : ""}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange(n);
            }
          }}
        >
          {n <= active ? <BsStarFill /> : <BsStar />}
        </span>
      ))}
    </div>
  );
}
