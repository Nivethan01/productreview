import React, { useState } from "react";
import "../App.css";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    // Reset error messages
    setEmailError("");
    setPasswordError("");
    setErrorMessage("");
    // Validate email
    if (!email) {
      setEmailError("Please enter your email");
      return;
    }
    // Validate password
    if (!password) {
      setPasswordError("Please enter your password");
      return;
    }
    Axios.post("http://localhost:3001/login", {
      email,
      password,
    }, {
      withCredentials: true // Ensure credentials are included
    })
      .then((response) => {
        if (response.status === 200) {
          // Save token to localStorage
          localStorage.setItem("token", response.data.token);
          navigate("/profile");
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          setErrorMessage("Incorrect email or password");
        } else {
          console.log(err);
          setErrorMessage("An unexpected error occurred");
        }
      });
  };
  return (
    <div className="sign-up-container">
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          autoComplete="off"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && <p className="error-message">{emailError}</p>}
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && <p className="error-message">{passwordError}</p>}
        <button type="submit">Login</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <p> 
          Don't Have an Account? <Link className="sign" to="/">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
