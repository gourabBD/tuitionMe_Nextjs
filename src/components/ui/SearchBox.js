"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";

/** Search field that pushes the term onto the catalogue route. */
export default function SearchBox({
  placeholder = "What do you want to learn today?",
  buttonLabel = "Search",
  maxWidth = 480,
}) {
  const [term, setTerm] = useState("");
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = term.trim();
    router.push(trimmed ? `/services?search=${encodeURIComponent(trimmed)}` : "/services");
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex mt-4" style={{ maxWidth }} role="search">
      <input
        className="tm-search form-control me-2"
        placeholder={placeholder}
        aria-label={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <Button type="submit" className="btn-tm-primary flex-shrink-0 border-0">
        {buttonLabel}
      </Button>
    </form>
  );
}
