import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Register service worker
if ("serviceWorker" in navigator) {
	navigator.serviceWorker
		.register("/service-worker.js")
		.then(function (registration) {
			console.log("Service Worker registered with scope:", registration.scope);
		})
		.catch(function (error) {
			console.log("Service Worker registration failed:", error);
		});
}

root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
