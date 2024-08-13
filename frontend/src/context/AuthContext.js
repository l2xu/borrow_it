import React, { createContext, useContext, useState, useEffect } from "react";

// The AuthContext is used to create the authentication context.
const AuthContext = createContext();

// The AuthProvider component is used to provide authentication context to the application.
// It takes children as props and provides the isAuth, login, logout, and getToken functions to the children.
export const AuthProvider = ({ children }) => {
	const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
	const [token, setTokenValue] = useState(localStorage.getItem("token"));

	// The login function is used to set the token in local storage and update the isAuth state.
	const login = (newToken) => {
		localStorage.setItem("token", newToken);
		setTokenValue(newToken);
		setIsAuth(true);
	};

	// The logout function is used to remove the token from local storage and update the isAuth state.
	const logout = () => {
		localStorage.removeItem("token");
		setTokenValue(null);
		setIsAuth(false);
	};

	// The getToken function is used to get the token value.
	const getToken = () => token;

	// The useEffect hook is used to check if the user is authenticated when the component mounts.
	useEffect(() => {
		const token = localStorage.getItem("token");
		setIsAuth(!!token);
		setTokenValue(token);
	}, []);

	return (
		<AuthContext.Provider value={{ isAuth, login, logout, getToken }}>
			{children}
		</AuthContext.Provider>
	);
};

// The useAuth hook is used to consume the authentication context.
export const useAuth = () => {
	return useContext(AuthContext);
};
