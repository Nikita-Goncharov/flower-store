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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/comments`);
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
        `${process.env.REACT_APP_API_URL}/comments`,
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
        <h1>Welcome to "Green Paradise"</h1>
        <p>We create beauty with love and care for our customers.</p>
      </header>

      <section className="history-section">
        <h2>History of our company</h2>
        <p>
        "Green Paradise" was founded in 2010 with the aim of providing high-quality flowers and bouquets for any event.
        We grow flowers in our own greenhouses and are constantly expanding our range so that every client can find the perfect bouquet.
        </p>
        <p>
        Our florists are true artists who create unique compositions that bring joy and emotions.
        </p>
      </section>

      <section className="info-section">
        <div className="why-choose-us">
          <h2>Why choose us?</h2>
          <div className="grid">
            <div className="card">Quality: Only the best flowers.</div>
            <div className="card">Unique bouquets: Exclusive compositions.</div>
            <div className="card">On-time delivery: Always on time.</div>
            <div className="card">Convenient service: Online ordering.</div>
            <div className="card">Customer Support: Help and Advice.</div>
          </div>
        </div>

        <div className="testimonials">
          <h2>Our customers' reviews</h2>

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
            <p>There are currently no feedbacks.</p>
          )}
          {isAuthenticated && (
            <div className="comment-form">
              <h3>Leave a feedback</h3>
              <form onSubmit={handleSubmit}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Your feedback..."
                  rows="4"
                  className="comment-textarea"
                  required
                />
                <button type="submit" className="comment-submit-button" disabled={loading}>
                  {loading ? "Sending..." : "Send"}
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
