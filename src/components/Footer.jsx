import React from "react";

const Footer = () => {
  return (
    <footer className="bg-light pt-5 border-top">
      <div className="container">
        <div className="row gy-4">

          {/* BRAND */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold">MidnightvibeX</h6>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-muted text-decoration-none">About Us</a></li>
              <li><a href="/press" className="text-muted text-decoration-none">Press</a></li>
              <li><a href="/blog" className="text-muted text-decoration-none">Blog</a></li>
              <li><a href="/creators" className="text-muted text-decoration-none">Creator&apos;s Blog</a></li>
              <li><a href="/advertising" className="text-muted text-decoration-none">Advertising</a></li>
            </ul>
          </div>

          {/* HELP */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold">Help & Support</h6>
            <ul className="list-unstyled">
              <li><a href="/faq" className="text-muted text-decoration-none">FAQ</a></li>
              <li><a href="/contact" className="text-muted text-decoration-none">Contact Us</a></li>
              <li><a href="/support" className="text-muted text-decoration-none">Support Center</a></li>
              <li><a href="/content-removal" className="text-muted text-decoration-none">Content Removal</a></li>
              <li><a href="/feedback" className="text-muted text-decoration-none">Feedback</a></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold">Legal</h6>
            <ul className="list-unstyled">
              <li><a href="/terms" className="text-muted text-decoration-none">Terms & Conditions</a></li>
              <li><a href="/privacy" className="text-muted text-decoration-none">Privacy Policy</a></li>
              <li><a href="/cookies" className="text-muted text-decoration-none">Cookies Policy</a></li>
              <li><a href="/community-guidelines" className="text-muted text-decoration-none">Community Guidelines</a></li>
              <li>
                <a href="/dmca" className="text-danger fw-semibold text-decoration-none">
                  DMCA / Copyright
                </a>
              </li>
              <li><a href="/trust-safety" className="text-muted text-decoration-none">Trust & Safety</a></li>
            </ul>
          </div>

          {/* MONETIZE */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold">Earn with Us</h6>
            <p className="small text-muted mb-2">
              Start earning by sharing exclusive content with your fans.
            </p>
            <a
              href="/become-creator"
              className="btn btn-success btn-sm mb-3"
            >
              Become a Creator
            </a>

            <h6 className="fw-bold mt-3">Follow Us</h6>
            <div className="d-flex gap-3">
              <a href="https://twitter.com" className="text-muted fs-5">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="https://instagram.com" className="text-muted fs-5">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://facebook.com" className="text-muted fs-5">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://telegram.org" className="text-muted fs-5">
                <i className="bi bi-telegram"></i>
              </a>
            </div>
          </div>

        </div>

        <hr />

        <div className="text-center small text-muted pb-3">
          © 2024–2026 MidnightvibeX.com — All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
