import Link from "next/link";
import {
  BsFacebook,
  BsInstagram,
  BsLinkedin,
  BsTwitter,
  BsYoutube,
} from "react-icons/bs";

const SOCIALS = [
  { href: "https://facebook.com", label: "Facebook", Icon: BsFacebook },
  { href: "https://twitter.com", label: "Twitter", Icon: BsTwitter },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: BsLinkedin },
  { href: "https://youtube.com", label: "YouTube", Icon: BsYoutube },
  { href: "https://instagram.com", label: "Instagram", Icon: BsInstagram },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="tm-footer">
      <div className="tm-container">
        <div className="row gy-4">
          <div className="col-6 col-lg-3">
            <Link href="/" className="tm-brand text-decoration-none d-inline-block mb-2">
              Tuition <span>Me</span>
            </Link>
            <p style={{ fontSize: "0.88rem" }}>
              A modern marketplace connecting motivated students with expert tutors
              for live, personalised learning.
            </p>
            <div className="mt-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="tm-social"
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <h6>Explore</h6>
            <Link href="/services">All Courses</Link>
            <Link href="/blogs">Resources &amp; FAQ</Link>
            <Link href="/addservice">Become an Instructor</Link>
            <Link href="/myreview">My Reviews</Link>
          </div>

          <div className="col-6 col-lg-3">
            <h6>Company</h6>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Create Account</Link>
          </div>

          <div className="col-6 col-lg-3">
            <h6>Get in touch</h6>
            <a href="mailto:support@tuitionme.com">support@tuitionme.com</a>
            <a href="tel:+8801000000000">+880 1000-000000</a>
            <span style={{ fontSize: "0.88rem" }}>Dhaka, Bangladesh</span>
          </div>
        </div>

        <div className="tm-footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <span>© {year} Tuition Me. All rights reserved.</span>
          <span>Built with Next.js, MongoDB &amp; Stripe.</span>
        </div>
      </div>
    </footer>
  );
}
