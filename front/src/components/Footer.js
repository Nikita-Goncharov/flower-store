import React from "react";
import "../design/HeaderFooter.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="https://t.me/oss_khctc" target="_blank" rel="noopener noreferrer" className="footer-link">
          Telegram
        </a>
        <a href="https://www.facebook.com/KharkivCollege" target="_blank" rel="noopener noreferrer" className="footer-link">
          Facebook
        </a>
        <a href="https://ct-college.net/" target="_blank" rel="noopener noreferrer" className="footer-link">
          Наш сайт
        </a>
      </div>
      <p className="footer-address">Наша адреса: 61002, м.Харків, вул. Манізера, 4 (ст. Метро Архітектора Бекетова)</p>
    </footer>
  );
}

export default Footer;