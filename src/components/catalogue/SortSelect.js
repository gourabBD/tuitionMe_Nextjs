"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "relevance", label: "Most relevant" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
];

/**
 * Sorting lives in the URL rather than component state, so a sorted catalogue
 * is a shareable link and survives a refresh or a back-navigation.
 */
export default function SortSelect({ value }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (next) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next && next !== "relevance") params.set("sort", next);
    else params.delete("sort");
    const query = params.toString();
    router.push(query ? `/services?${query}` : "/services");
  };

  return (
    <select
      className="tm-search form-select"
      style={{ maxWidth: 220 }}
      value={value}
      aria-label="Sort courses"
      onChange={(e) => handleChange(e.target.value)}
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
