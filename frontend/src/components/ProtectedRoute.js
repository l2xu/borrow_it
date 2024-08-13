import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// The ProtectedRoute component is used to protect routes that require authentication.
// It takes the element prop and checks if the user is authenticated.
// If the user is authenticated, it renders the element, otherwise it redirects to the login page.
const ProtectedRoute = ({ element }) => {
	const { isAuth } = useAuth();
	return isAuth ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
