import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../design/Home.css";

function Home() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get("http://localhost:8000/comments");
      if (response.data.success) {
        setComments(response.data.data);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      return;
    }
    setLoading(true);
    setErrorMessage("");

    try {
      await axios.post(
        "http://localhost:8000/comments",
        { text: newComment },
        {
          headers: {
            token: token,
          },
        }
      );
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error.response && error.response.status === 403) {
        setErrorMessage("Помилка: Невірний токен або неавторизований доступ.");
        navigate("/login");
      } else {
        setErrorMessage("Сталася помилка при створенні коментаря.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
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

          {comments.length > 0 ? (
            comments.map((comment) => (
              <div className="testimonial" key={comment.id}>
                <blockquote>
                  "{comment.text}"
                  <footer>- {comment.username}</footer>
                </blockquote>
              </div>
            ))
          ) : (
            <p>Наразі немає відгуків.</p>
          )}
          {isAuthenticated && (
            <div className="comment-form">
              <h3>Залишити відгук</h3>
              <form onSubmit={handleSubmit}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ваш відгук..."
                  rows="4"
                  className="comment-textarea"
                  required
                />
                <button type="submit" className="comment-submit-button" disabled={loading}>
                  {loading ? "Надсилання..." : "Надіслати"}
                </button>
              </form>
              {errorMessage && <p className="comment-error">{errorMessage}</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
