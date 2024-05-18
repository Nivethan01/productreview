import React, { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import Profile from "./Components/Profile";
import Secure from "./Components/Secure";
import ProductList from "./Components/ProductList";

function App() {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/pro");
        setProduct(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Secure element={Profile} />} />
          <Route
            path="/productList"
            element={<ProductList product={product} setProduct={setProduct} />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
