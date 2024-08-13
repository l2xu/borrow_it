import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, MessageSquare, Plus, Grid2X2, UserRound } from "lucide-react";

// The Navigation component is used to show the navigation bar at the bottom of the screen.
// It uses the useLocation hook to get the current path and highlights the active route.
const Navigation = () => {
	const location = useLocation();
	const currentPath = location.pathname;

	const isActive = (path) => {
		if (path === "/" && currentPath === "/") {
			return true; // Exact match for the root path
		} else if (path !== "/" && currentPath.startsWith(path)) {
			return true; // Partial match for nested routes
		} else {
			return false;
		}
	};

	// This function renders the icon with a background circle and a black square behind it.
	// The icon is scaled up and the background circle is shown when the route is active.
	const renderIcon = (IconComponent, path) => (
		<div className="relative flex justify-center items-center">
			<div
				className={`absolute align-middle flex justify-center -z-20 transition duration-75 ease-in-out ${
					isActive(path) ? "opacity-100 scale-100" : "opacity-0 scale-0"
				}`}
			>
				<div className="bg-black aspect-square w-14 rounded-full flex items-center justify-center -mt-7"></div>
			</div>
			<div
				className={`transition-all duration-75 ease-in-out ${
					isActive(path)
						? "mb-6 transform scale-110"
						: "mb-0 transform scale-100"
				}`}
			>
				<IconComponent color="white" size={24} />
			</div>
		</div>
	);

	return (
		<nav className="bg-black fixed bottom-0 w-full p-2 flex h-14 justify-around items-center z-10">
			<Link to="/">{renderIcon(Search, "/")}</Link>
			<Link to="/chat">{renderIcon(MessageSquare, "/chat")}</Link>
			<Link to="/add">{renderIcon(Plus, "/add")}</Link>
			<Link to="/user-items">{renderIcon(Grid2X2, "/user-items")}</Link>
			<Link to="/profile">{renderIcon(UserRound, "/profile")}</Link>
		</nav>
	);
};

export default Navigation;
