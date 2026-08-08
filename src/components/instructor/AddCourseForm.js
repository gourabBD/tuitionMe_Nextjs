"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import toast from "react-hot-toast";

import { ApiError, apiPost } from "@/lib/api-client";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

export default function AddCourseForm({ defaultInstructorName }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const field = (name) => form.elements.namedItem(name).value.trim();

    // `instructorEmail` is deliberately absent — the server takes ownership
    // from the session cookie, so it can't be spoofed from here.
    const payload = {
      subject: field("subject"),
      category: field("category"),
      instructor: field("instructor"),
      img: field("img"),
      description: field("description"),
      class: field("class"),
      days: field("days"),
      level: field("level"),
      cost: Number(field("cost")),
    };

    const originalCost = field("originalCost");
    if (originalCost) payload.originalCost = Number(originalCost);

    setBusy(true);
    try {
      const data = await apiPost("/api/courses", payload);
      toast.success("Course published! Now add your video/PDF lessons.");
      form.reset();
      router.push(`/manage/${data.insertedId}`);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not publish the course."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="tm-form tm-surface p-4">
      <div className="row g-3">
        <div className="col-md-8">
          <Form.Label htmlFor="subject">Subject / course title</Form.Label>
          <input
            id="subject"
            className="form-control"
            name="subject"
            maxLength={140}
            placeholder="e.g. Complete Physics for HSC"
            required
          />
        </div>
        <div className="col-md-4">
          <Form.Label htmlFor="category">Category</Form.Label>
          <input
            id="category"
            className="form-control"
            name="category"
            maxLength={60}
            placeholder="e.g. Science"
            required
          />
        </div>

        <div className="col-md-6">
          <Form.Label htmlFor="instructor">Instructor name</Form.Label>
          <input
            id="instructor"
            className="form-control"
            name="instructor"
            maxLength={80}
            placeholder="Your name"
            defaultValue={defaultInstructorName || ""}
            required
          />
        </div>
        <div className="col-md-6">
          <Form.Label htmlFor="level">Level</Form.Label>
          <select id="level" className="form-select" name="level" defaultValue="All Levels">
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <Form.Label htmlFor="cost">Price / month (৳)</Form.Label>
          <input
            id="cost"
            className="form-control"
            type="number"
            min={1}
            name="cost"
            placeholder="1500"
            required
          />
        </div>
        <div className="col-md-4">
          <Form.Label htmlFor="originalCost">Original price (optional)</Form.Label>
          <input
            id="originalCost"
            className="form-control"
            type="number"
            min={1}
            name="originalCost"
            placeholder="2000"
          />
        </div>
        <div className="col-md-4">
          <Form.Label htmlFor="days">Days / week</Form.Label>
          <input
            id="days"
            className="form-control"
            name="days"
            maxLength={40}
            placeholder="3"
            required
          />
        </div>

        <div className="col-md-6">
          <Form.Label htmlFor="class">Students of class</Form.Label>
          <input
            id="class"
            className="form-control"
            name="class"
            maxLength={60}
            placeholder="e.g. 9-10"
            required
          />
        </div>
        <div className="col-md-6">
          <Form.Label htmlFor="img">Cover image URL</Form.Label>
          <input
            id="img"
            className="form-control"
            type="url"
            name="img"
            placeholder="https://..."
            required
          />
        </div>

        <div className="col-12">
          <Form.Label htmlFor="description">Description</Form.Label>
          <textarea
            id="description"
            className="form-control"
            name="description"
            rows={4}
            maxLength={4000}
            placeholder="Describe what students will learn..."
            required
          />
        </div>
      </div>

      <Button className="btn-tm-primary border-0 mt-4" type="submit" disabled={busy}>
        {busy ? "Publishing…" : "Publish course"}
      </Button>
    </Form>
  );
}
