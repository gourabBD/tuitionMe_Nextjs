import { BsStar, BsStarFill, BsStarHalf } from "react-icons/bs";

/** Read-only star display, e.g. `<StarRating value={4.6} />`. */
export default function StarRating({ value = 0, size = 14 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = Math.max(5 - full - (half ? 1 : 0), 0);

  return (
    <span
      className="stars d-inline-flex align-items-center"
      style={{ gap: 2 }}
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <BsStarFill key={`f${i}`} size={size} />
      ))}
      {half && <BsStarHalf size={size} />}
      {Array.from({ length: empty }).map((_, i) => (
        <BsStar key={`e${i}`} size={size} />
      ))}
    </span>
  );
}
