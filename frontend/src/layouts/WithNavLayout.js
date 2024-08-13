import React from "react";
import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";
import PageTransition from "../components/PageTransition";

// The WithNavLayout component is used to wrap the application with a navigation bar at the bottom.
// It uses the PageTransition component to animate page transitions.
// The Outlet component is used to render the child routes.
const WithNavLayout = () => {
	return (
		<>
			<PageTransition>
				<div className="flex flex-col min-h-screen pb-14">
					<div className="p-4 flex-grow flex flex-col">
						<Outlet />
					</div>
				</div>
			</PageTransition>
			<Navigation />
		</>
	);
};

export default WithNavLayout;
