import React from "react";
import "../design/Home.css";

function Home() {
  return (
    <div className="home-container">
      {}
      <header className="home-header">
        <h1>Ласкаво просимо до "Зелений Рай"</h1>
        <p>Ми створюємо красу з любов'ю та турботою про наших клієнтів.</p>
      </header>

      <section className="history-section">
        <h2>Історія нашої компанії</h2>
        <p>
          "Зелений Рай" була заснована в 2010 році з метою надання високоякісних квітів та букетів для будь-яких подій. 
          Ми вирощуємо квіти у власних теплицях і постійно розширюємо асортимент, щоб кожен клієнт міг знайти ідеальний букет.
        </p>
        <p>
          Наші флористи — справжні художники, які створюють унікальні композиції, що приносять радість та емоції.
        </p>
      </section>

      <section className="info-section">
        <div className="why-choose-us">
          <h2>Чому обирають нас?</h2>
          <div className="grid">
            <div className="card">Якість: Тільки найкращі квіти.</div>
            <div className="card">Унікальні букети: Ексклюзивні композиції.</div>
            <div className="card">Доставка вчасно: Завжди у зазначений час.</div>
            <div className="card">Зручний сервіс: Онлайн-замовлення.</div>
            <div className="card">Підтримка клієнтів: Допомога та консультації.</div>
          </div>
        </div>

        <div className="testimonials">
          <h2>Відгуки наших клієнтів</h2>
          <div className="testimonial">
            <blockquote>
              "Чудовий магазин! Замовив букет для дружини, і вона була в захваті!"
              <footer>- Олексій, клієнт</footer>
            </blockquote>
          </div>
          <div className="testimonial">
            <blockquote>
              "Дуже вдячна за швидку доставку. Букет виглядав просто неймовірно!"
              <footer>- Ольга, клієнт</footer>
            </blockquote>
          </div>
          <div className="testimonial">
            <blockquote>
              "Я замовив букет для мами. Квіти довго залишались свіжими!"
              <footer>- Дмитро, клієнт</footer>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;