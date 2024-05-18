import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:3001/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="profile">
      <div className="profile-content">
        <h1>Welcome, {userData.username}</h1>
        <button className="dash">
          <Link to="/productList">ProductList</Link>
        </button>
      </div>
      <button className="logOut" onClick={handleLogout}>
        LogOut
      </button>
    </div>
  );
};

export default Profile;
