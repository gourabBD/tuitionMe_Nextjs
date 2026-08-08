import {
  BsBoxArrowUpRight,
  BsFileEarmarkPdfFill,
  BsPlayBtnFill,
} from "react-icons/bs";

import { getYouTubeEmbedUrl } from "@/lib/course";

/**
 * Renders unlocked lesson content.
 *
 * Only YouTube URLs are ever embedded in an iframe — anything else is a plain
 * link. Embedding an arbitrary instructor-supplied URL would hand that origin
 * a frame inside our page.
 */
export default function LessonList({ lessons }) {
  if (lessons.length === 0) {
    return (
      <div className="tm-empty py-4">
        The instructor hasn&apos;t added any lessons yet.
      </div>
    );
  }

  return (
    <div className="d-grid gap-3">
      {lessons.map((item) => {
        const embedUrl = item.type === "video" ? getYouTubeEmbedUrl(item.url) : null;

        return (
          <div key={item.id} className="tm-surface-alt p-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              {item.type === "video" ? (
                <BsPlayBtnFill className="text-primary" />
              ) : (
                <BsFileEarmarkPdfFill className="text-primary" />
              )}
              <span className="fw-semibold">{item.title}</span>
            </div>

            {embedUrl ? (
              <div style={{ position: "relative", paddingTop: "56.25%" }}>
                <iframe
                  src={embedUrl}
                  title={item.title}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                    borderRadius: "var(--radius-sm)",
                  }}
                />
              </div>
            ) : (
              <a
                href={item.url}
                target="_blank"
                // noopener/noreferrer keeps the opened page from reaching back
                // into this one through window.opener.
                rel="noreferrer noopener"
                className="btn-tm-outline text-decoration-none d-inline-flex align-items-center gap-2"
              >
                {item.type === "video" ? "Watch video" : "View PDF"}{" "}
                <BsBoxArrowUpRight />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
