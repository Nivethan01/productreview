import React from "react";
import { Route, Navigate } from "react-router-dom";

const Secure = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem("token");
 console.log(token);
  return token ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default Secure;
