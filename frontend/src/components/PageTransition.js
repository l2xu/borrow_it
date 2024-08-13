import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useLocation } from "react-router-dom";

// The PageTransition component is used to animate page transitions.
// It uses the useLocation hook to get the current location and wraps the children in a TransitionGroup.
// The CSSTransition component is used to animate the page transitions.
const PageTransition = ({ children }) => {
	const location = useLocation();

	return (
		<TransitionGroup component={null}>
			<CSSTransition
				key={location.key}
				timeout={300}
				classNames="page"
				unmountOnExit
			>
				<div className="page-wrapper">{children}</div>
			</CSSTransition>
		</TransitionGroup>
	);
};

export default PageTransition;
