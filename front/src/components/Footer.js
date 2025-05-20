import React from "react";
import "../design/HeaderFooter.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a
          href="https://t.me/oss_khctc"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Telegram
        </a>
        <a
          href="https://www.facebook.com/KharkivCollege"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Facebook
        </a>
        <a
          href="https://ct-college.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Our site
        </a>
      </div>
      <p className="footer-address">
      Our address: 61002, Kharkiv, Manizera St., 4 (Architectura Beketova Metro Station)
      </p>
    </footer>
  );
}

export default Footer;
