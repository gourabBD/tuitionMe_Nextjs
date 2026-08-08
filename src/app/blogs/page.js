import FaqAccordion from "@/components/ui/FaqAccordion";

export const metadata = {
  title: "Resources & FAQ",
  description: "Everything you need to know before getting started with Tuition Me.",
};

export default function BlogsPage() {
  return (
    <div className="tm-page tm-section">
      <div className="tm-container" style={{ maxWidth: 820 }}>
        <span className="tm-eyebrow">Resources</span>
        <h2 className="tm-section-title">Frequently asked questions</h2>
        <p className="tm-section-sub">
          Everything you need to know before you get started.
        </p>

        <FaqAccordion />
      </div>
    </div>
  );
}
