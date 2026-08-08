"use client";

import Carousel from "react-bootstrap/Carousel";

const SKILLS = [
  {
    name: "Next.js",
    tagline: "The full-stack React framework for production",
    icon: "https://cdn.simpleicons.org/nextdotjs/white",
    background: "linear-gradient(135deg, #000000, #1a1a1a)",
  },
  {
    name: "React",
    tagline: "Build fast, interactive user interfaces",
    icon: "https://cdn.simpleicons.org/react/61DAFB",
    background: "linear-gradient(135deg, #0b1220, #123048)",
  },
  {
    name: "Claude",
    tagline: "Anthropic's AI assistant for modern development",
    icon: "https://cdn.simpleicons.org/claude/white",
    background: "linear-gradient(135deg, #D97757, #b85a3e)",
  },
];

export default function SkillsCarousel() {
  return (
    <Carousel>
      {SKILLS.map((skill) => (
        <Carousel.Item key={skill.name}>
          <div
            className="d-flex align-items-center justify-content-center gap-3"
            style={{ height: 200, background: skill.background }}
          >
            <img src={skill.icon} alt="" style={{ height: 56, width: 56 }} />
            <div className="text-start">
              <h4
                className="mb-1"
                style={{
                  color: "#fff",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                }}
              >
                {skill.name}
              </h4>
              <p
                className="mb-0"
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}
              >
                {skill.tagline}
              </p>
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
