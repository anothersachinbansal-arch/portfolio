import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check auth on route change and on storage change
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken");
      setIsLoggedIn(!!token);
    };
    checkAuth();
    const onStorage = (e) => {
      if (e.key === "adminToken") checkAuth();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id) => {
    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    if (location.pathname !== "/") {
      navigate("/");
      // wait a tick for home to render
      setTimeout(doScroll, 150);
    } else {
      doScroll();
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    setIsLoggedIn(false);
    navigate("/");
    setIsMenuOpen(false);
  };

  // Double click on brand navigates to login
  const handleBrandDoubleClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link
          to="/"
          className="navbar-brand"
          onDoubleClick={handleBrandDoubleClick}
        >
          {/* Brand Logo */}
          <div className="brand-logo">
            <img src="/aboutpic.png" alt="Logo" />
          </div>

          {/* Brand Text */}
          <div className="brand-text">
            <span className="brand-name">Sachin Bansal</span>
          </div>
        </Link>

        {/* Brand: single-click -> home, double-click -> login */}
      

        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <div className="navbar-start">
            <button
              className="navbar-item"
              onClick={() => scrollToSection("about")}
            >
              <i className="fas fa-info-circle"></i>
              <span>ABOUT</span>
            </button>
            <button
              className="navbar-item"
              onClick={() => scrollToSection("contact")}
            >
              <i className="fas fa-envelope"></i>
              <span>CONTACT ME</span>
            </button>
            <Link to="/aptitude-test" className="navbar-item" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-question-circle"></i>
              <span>APTITUDE TEST</span>
            </Link>
            <Link to="/career-aptitude-test" className="navbar-item" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-briefcase"></i>
              <span>CAREER TEST</span>
            </Link>

            <div className="login-button">
              {isLoggedIn ? (
                location.pathname === "/admin" ? (
                  <button onClick={handleLogout}>Logout</button>
                ) : (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <button>Admin</button>
                  </Link>
                )
              ) : location.pathname === "/" ? null : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                
                </Link>
              )}
            </div>
          </div>
        </div>

        <button
          className={`navbar-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
