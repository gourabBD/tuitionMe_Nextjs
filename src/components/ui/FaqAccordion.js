"use client";

import Accordion from "react-bootstrap/Accordion";

const FAQS = [
  {
    q: "How does tutor matching work?",
    a: "Browse our catalogue, filter by subject or category, and read verified reviews before enrolling with a tutor that fits your schedule and budget.",
  },
  {
    q: "How and when do I pay?",
    a: "Course pricing is shown per month on every course page. You pay securely through Stripe Checkout, and your lessons unlock as soon as the payment clears.",
  },
  {
    q: "Can I leave a review after a course?",
    a: 'Yes — once you\'re logged in, open any course page and click "Write a review" to rate and review your instructor. You can edit or delete your own review at any time.',
  },
  {
    q: "How do I become an instructor on Tuition Me?",
    a: 'Create an account, then use "Teach on Tuition Me" from the navigation menu to publish your first course in minutes and attach your video and PDF lessons.',
  },
];

export default function FaqAccordion() {
  return (
    <Accordion>
      {FAQS.map((item, index) => (
        <Accordion.Item eventKey={String(index)} key={item.q}>
          <Accordion.Header>{item.q}</Accordion.Header>
          <Accordion.Body className="tm-text-muted">{item.a}</Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
