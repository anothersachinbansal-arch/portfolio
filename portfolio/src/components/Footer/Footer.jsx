import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer id="contact" className="footer" role="contentinfo">
      <div className="footer-container">
        {/* Left Image (Clickable) */}
        <div className="footer-image">
          <a
            href="https://www.linkedin.com/in/thesachinbansal/" // Replace with your desired redirect
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/aboutpic.png" alt="Footer visual" />
          </a>
        </div>

        {/* Right Content */}
        <div className="footer-content">
          {/* Brand / About */}
          <div className="footer-column brand">
            <h2 className="footer-title">Sachin Bansal</h2>
            <p className="tagline">
              Empowering Minds, Shaping Futures <br />
              Explore the World of Social Sciences with Sachin Sir
            </p>

            <div className="social-links" aria-label="Social media links">
              <a
                href="https://www.facebook.com/thesachinbansal/"
                aria-label="Visit our Facebook"
                target="_blank"
                rel="noopener noreferrer"
                style={{fontSize: "23px",marginTop:"6px"}}
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://www.instagram.com/thesachinbansal/"
                aria-label="Visit our Instagram"
                target="_blank"
                rel="noopener noreferrer"
                style={{fontSize: "27px",marginTop:"4px"}}
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://www.youtube.com/solupdates/"
                aria-label="Visit our YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a
                href="https://www.youtube.com/thesecularhouse/"
                aria-label="Visit our YouTube Channel"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer-column contact">
            <h3>Contact Me</h3>
            <p>
              <strong>For Admission/Career Related Guidance</strong>
              <br />
              <a href="mailto:2sachinbansal@gmail.com">2sachinbansal@gmail.com</a>
              <br />
              <a href="tel:+919821925020">+91 9821925020</a>
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Sachin Bansal. All Rights Reserved.</p><span>website Designed and Developed By <a href="https://upsoma.in" style={{textDecoration:'none',fontSize:'18px',fontWeight:600,color:'#16a34a'}}>Upsoma Consultany</a> </span>
      </div>
    </footer>
  );
};

export default Footer;
