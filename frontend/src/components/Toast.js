import React from "react";

// The Toast component is used to show a toast message.
// It takes message, show, and color as props.
// The message prop is the text to show in the toast.
const Toast = ({ message, show, color }) => {
	const toastColor = color || "accent";

	return (
		<div
			className={`fixed top-0 left-0 w-full h-20 p-4 bg-${toastColor} text-white rounded-b-2xl shadow-lg transition-all duration-500 flex items-center justify-center ${
				show ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
			}`}
		>
			{message}
		</div>
	);
};

export default Toast;
