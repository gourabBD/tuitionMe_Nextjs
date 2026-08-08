"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { BiSearch, BiUser } from "react-icons/bi";
import { BsMoonStarsFill, BsPlusCircle, BsSunFill } from "react-icons/bs";
import toast from "react-hot-toast";

import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [term, setTerm] = useState("");
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (event) => {
    event.preventDefault();
    setExpanded(false);
    const trimmed = term.trim();
    router.push(trimmed ? `/services?search=${encodeURIComponent(trimmed)}` : "/services");
  };

  const handleLogOut = async () => {
    await logout();
    toast.success("Signed out.");
    router.push("/");
    router.refresh();
  };

  const navLinkClass = (href) =>
    `tm-nav-link py-2 ${pathname === href ? "active" : ""}`;

  const searchField = (placeholder) => (
    <div className="position-relative w-100">
      <BiSearch
        className="position-absolute"
        style={{
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--color-text-muted)",
        }}
      />
      <input
        type="search"
        className="tm-search form-control ps-5"
        placeholder={placeholder}
        aria-label="Search courses"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
    </div>
  );

  return (
    <Navbar
      className="tm-navbar px-3 px-lg-4 py-2"
      expand="lg"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid className="px-0">
        <Navbar.Brand
          as={Link}
          href="/"
          className="tm-brand d-flex align-items-center"
          onClick={() => setExpanded(false)}
        >
          <img
            src="/brand-mark.png"
            alt=""
            style={{ height: 34, width: 34 }}
            className="me-2"
          />
          Tuition <span>Me</span>
        </Navbar.Brand>

        <form
          onSubmit={handleSearch}
          className="d-none d-md-flex mx-3 flex-grow-1"
          style={{ maxWidth: 420 }}
          role="search"
        >
          {searchField("Search for courses, subjects...")}
        </form>

        <button
          type="button"
          className="theme-toggle order-lg-3 ms-2"
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle dark and light mode"
        >
          {theme === "dark" ? <BsSunFill /> : <BsMoonStarsFill />}
        </button>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="ms-2" />
        <Navbar.Collapse id="responsive-navbar-nav" className="mt-3 mt-lg-0">
          <form onSubmit={handleSearch} className="d-flex d-md-none mb-3" role="search">
            {searchField("Search for courses...")}
          </form>

          <Nav className="me-auto align-items-lg-center gap-lg-4">
            <Link
              className={navLinkClass("/services")}
              href="/services"
              onClick={() => setExpanded(false)}
            >
              Courses
            </Link>
            <Link
              className={navLinkClass("/blogs")}
              href="/blogs"
              onClick={() => setExpanded(false)}
            >
              Resources
            </Link>
            {user && (
              <Link
                className={navLinkClass("/addservice")}
                href="/addservice"
                onClick={() => setExpanded(false)}
              >
                <BsPlusCircle className="me-1 mb-1" /> Teach on Tuition Me
              </Link>
            )}
          </Nav>

          <Nav className="align-items-lg-center gap-lg-2">
            {user ? (
              <NavDropdown
                align="end"
                id="user-dropdown"
                title={
                  <span className="d-inline-flex align-items-center">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt=""
                        className="rounded-circle me-2"
                        style={{ height: 30, width: 30, objectFit: "cover" }}
                      />
                    ) : (
                      <BiUser size={22} className="me-2" />
                    )}
                    <span className="fw-semibold">{user.name || "Account"}</span>
                  </span>
                }
              >
                <NavDropdown.Item as={Link} href="/myreview">
                  My Reviews
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} href="/my-courses">
                  My Courses (Teaching)
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogOut}>Log Out</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Link
                  className="btn-tm-ghost text-decoration-none text-center"
                  href="/login"
                  onClick={() => setExpanded(false)}
                >
                  Login
                </Link>
                <Link
                  className="btn-tm-primary text-decoration-none text-center"
                  href="/register"
                  onClick={() => setExpanded(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
