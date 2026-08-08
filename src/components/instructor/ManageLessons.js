"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import { BsFileEarmarkPdfFill, BsPlayBtnFill, BsTrash } from "react-icons/bs";
import toast from "react-hot-toast";

import { ApiError, apiDelete, apiPost } from "@/lib/api-client";

/**
 * Lesson editor for a course the signed-in user owns.
 *
 * The server re-checks ownership on every add/remove — this component only
 * decides what to draw, never who is allowed to do it.
 */
export default function ManageLessons({ courseId, courseTitle, initialLessons }) {
  const router = useRouter();
  const [items, setItems] = useState(initialLessons);
  const [type, setType] = useState("video");
  const [busy, setBusy] = useState(false);

  const handleAdd = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = form.elements.namedItem("title").value.trim();
    const url = form.elements.namedItem("url").value.trim();

    setBusy(true);
    try {
      const data = await apiPost(`/api/courses/${courseId}/content`, {
        type,
        title,
        url,
      });
      setItems((prev) => [...prev, data.item]);
      form.reset();
      toast.success("Lesson added");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not add lesson.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Remove this lesson?")) return;

    try {
      await apiDelete(`/api/courses/${courseId}/content/${itemId}`);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("Lesson removed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove lesson.");
    }
  };

  return (
    <>
      <form onSubmit={handleAdd} className="tm-form tm-surface p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="d-block mb-1" htmlFor="lesson-type">
              Type
            </label>
            <select
              id="lesson-type"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="d-block mb-1" htmlFor="lesson-title">
              Title
            </label>
            <input
              id="lesson-title"
              className="form-control"
              name="title"
              maxLength={160}
              placeholder="e.g. Lecture 1: Introduction"
              required
            />
          </div>
          <div className="col-md-5">
            <label className="d-block mb-1" htmlFor="lesson-url">
              URL
            </label>
            <input
              id="lesson-url"
              className="form-control"
              type="url"
              name="url"
              placeholder={type === "video" ? "YouTube / video URL" : "PDF URL"}
              required
            />
          </div>
        </div>
        <Button type="submit" className="btn-tm-primary border-0 mt-3" disabled={busy}>
          {busy ? "Adding…" : "Add lesson"}
        </Button>
      </form>

      {items.length === 0 ? (
        <div className="tm-empty">No lessons yet — add your first one above.</div>
      ) : (
        <div className="d-grid gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="tm-surface p-3 d-flex align-items-center justify-content-between gap-3"
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                {item.type === "video" ? (
                  <BsPlayBtnFill className="text-primary flex-shrink-0" size={20} />
                ) : (
                  <BsFileEarmarkPdfFill className="text-primary flex-shrink-0" size={20} />
                )}
                <div className="text-truncate">
                  <div className="fw-semibold">{item.title}</div>
                  <div
                    className="tm-text-muted text-truncate"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {item.url}
                  </div>
                </div>
              </div>
              <Button
                variant="link"
                className="text-danger p-0 flex-shrink-0"
                aria-label={`Remove ${item.title}`}
                onClick={() => handleDelete(item.id)}
              >
                <BsTrash />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        className="btn-tm-outline mt-4"
        onClick={() => {
          router.push(`/services/${courseId}`);
          router.refresh();
        }}
      >
        Done — view course page
      </Button>

      <span className="visually-hidden">Managing lessons for {courseTitle}</span>
    </>
  );
}
