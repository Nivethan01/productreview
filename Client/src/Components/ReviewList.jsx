import React, { useState, useEffect } from "react";
import axios from "axios";

const ReviewList = ({ productId, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/products/${productId}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3001/reviews/${id}`);
      if (response.status === 200) {
        const updatedReviews = reviews.filter((review) => review._id !== id);
        setReviews(updatedReviews);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleEdit = (id) => {
    setIsEdit(true);
    setEditId(id);
    const review = reviews.find((review) => review._id === id);
    setReviewText(review.reviewText);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { reviewText, productId };
    try {
      if (!isEdit) {
        const response = await axios.post("http://localhost:3001/reviews", data);
        setReviews([...reviews, response.data]);
      } else {
        const response = await axios.put(`http://localhost:3001/reviews/${editId}`, { reviewText });
        setReviews(reviews.map((review) => (review._id === editId ? response.data : review)));
        setIsEdit(false);
      }
      setReviewText("");
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div className="review-list">
      <h2>Reviews</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Give your Review:</label>
          <input
            type="text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>
        <button type="submit">{isEdit ? "Update" : "Add"}</button>
      </form>
      <ul>
        {reviews.map((review) => (
          <li key={review._id}>
            {review.reviewText}
            <button onClick={() => handleEdit(review._id)}>Edit</button>
            <button onClick={() => handleDelete(review._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewList;
