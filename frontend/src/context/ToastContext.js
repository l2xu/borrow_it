import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

// The ToastContext is used to create the toast context.
const ToastContext = createContext();

// The useToast hook is used to consume the toast context.
export const useToast = () => {
	return useContext(ToastContext);
};

// The ToastProvider component is used to provide toast context to the application.
// It takes children as props and provides the showToast function to the children.
export const ToastProvider = ({ children }) => {
	const [toast, setToast] = useState({ message: "", show: false, color: "" });

	// The showToast function is used to show a toast message.
	const showToast = useCallback((message, color) => {
		setToast({ message, show: true, color });
		setTimeout(() => {
			setToast({ message: "", show: false, color: "" });
		}, 1500);
	}, []);

	return (
		<ToastContext.Provider value={showToast}>
			{children}
			<Toast message={toast.message} color={toast.color} show={toast.show} />
		</ToastContext.Provider>
	);
};
